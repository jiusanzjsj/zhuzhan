#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
抓取 ChainThink 文章列表与图片，输出到 public/data/chainthink-news.json

用法：
  python scripts/fetch_chainthink.py
  python scripts/fetch_chainthink.py --limit 20 --with-detail
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional

BASE_DIR = pathlib.Path(__file__).resolve().parents[1]
OUTPUT_PATH = BASE_DIR / "public" / "data" / "chainthink-news.json"
LIST_URL = "https://chainthink.cn/zh-CN/article"
DETAIL_URL_PREFIX = "https://chainthink.cn/zh-CN/article/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
)


def http_get(url: str, timeout: int = 15) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        charset = resp.headers.get_content_charset() or "utf-8"
        data = resp.read()
    return data.decode(charset, errors="replace")



def decode_next_f_payload(html_text: str) -> str:
    """提取 self.__next_f.push([1,"..."]) 内层字符串并做一次反转义。"""
    marker = '[1,"'
    start = html_text.find(marker)
    if start == -1:
        raise ValueError("未找到 Next.js payload 起始位置")

    start += len(marker)
    end = html_text.rfind('"]])')
    if end == -1 or end <= start:
        raise ValueError("未找到 Next.js payload 结束位置")

    raw = html_text[start:end]
    # 只做当前页面实际需要的反转义
    return (
        raw.replace(r'\"', '"')
        .replace(r'\n', '\n')
        .replace(r'\\', r'\')
    )



def extract_json_object_after_key(text: str, key_with_quotes: str) -> Dict[str, Any]:
    idx = text.find(key_with_quotes)
    if idx == -1:
        raise ValueError(f"未找到键: {key_with_quotes}")

    after = text[idx + len(key_with_quotes):]
    obj_start = after.find('{"')
    if obj_start == -1:
        raise ValueError(f"未找到 {key_with_quotes} 对应 JSON 对象起点")

    pos = obj_start
    depth = 0
    in_string = False
    escape = False

    while pos < len(after):
        ch = after[pos]
        if in_string:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == '"':
                in_string = False
        else:
            if ch == '"':
                in_string = True
            elif ch in '{[':
                depth += 1
            elif ch in '}]':
                depth -= 1
                if depth == 0:
                    json_raw = after[obj_start:pos + 1]
                    return json.loads(json_raw)
        pos += 1

    raise ValueError(f"未能完整提取 {key_with_quotes} 对应 JSON 对象")



def format_publish_time(ts: Any) -> str:
    try:
        ts_int = int(ts)
    except Exception:
        return ""
    dt_obj = dt.datetime.fromtimestamp(ts_int)
    return dt_obj.strftime("%m-%d %H:%M")



def normalize_image(src: str) -> str:
    if not src:
        return ""
    src = html.unescape(str(src)).strip()
    if src.startswith("http://") or src.startswith("https://"):
        return src
    if src.startswith("/_next/image?url="):
        parsed = urllib.parse.urlparse(src)
        qs = urllib.parse.parse_qs(parsed.query)
        if qs.get("url"):
            return urllib.parse.unquote(qs["url"][0])
        return "https://chainthink.cn" + src
    if src.startswith("//"):
        return "https:" + src
    if src.startswith("/"):
        return "https://chainthink.cn" + src
    return src



def strip_tags(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<script[\s\S]*?</script>", "", text, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", "", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text



def fetch_detail(detail_id: str) -> Dict[str, str]:
    url = DETAIL_URL_PREFIX + str(detail_id)
    try:
        page = http_get(url, timeout=15)
    except Exception:
        return {"content": "", "image": ""}

    image = ""
    m = re.search(r'"coverImage":"([^"]+)"', page)
    if m:
        image = normalize_image(m.group(1))

    content = ""
    # 优先抓 text 字段（常见为 HTML 片段或富文本）
    m = re.search(r'"text":"([\s\S]*?)","title":"', page)
    if m:
        raw_text = m.group(1)
        raw_text = raw_text.encode("utf-8").decode("unicode_escape", errors="ignore")
        content = strip_tags(raw_text)

    return {"content": content, "image": image}



def build_items(payload_text: str, limit: int, with_detail: bool) -> List[Dict[str, Any]]:
    latest = extract_json_object_after_key(payload_text, '"initialLatestData"')
    items = latest.get("list") or []
    results: List[Dict[str, Any]] = []

    for item in items[:limit]:
        info = item.get("info") or {}
        article_id = str(item.get("id") or "")
        title = str(info.get("title") or "").strip()
        if not title:
            continue
        if any(word in title for word in ("ChainThink链智库", "ChainThink", "链智库")):
            continue

        result = {
            "id": article_id,
            "title": title,
            "summary": str(info.get("abstract") or "").strip(),
            "time": format_publish_time(item.get("publishTime")),
            "published_at": item.get("publishTime"),
            "url": DETAIL_URL_PREFIX + article_id if article_id else LIST_URL,
            "tags": [tag.get("tagName") for tag in (item.get("contentTags") or []) if tag.get("tagName")],
            "isImportant": bool(item.get("isGood")),
            "coverImage": normalize_image(str(info.get("coverImage") or "")),
            "content": "",
            "source": "ChainThink",
        }

        if with_detail and article_id:
            detail = fetch_detail(article_id)
            if detail.get("image") and not result["coverImage"]:
                result["coverImage"] = detail["image"]
            if detail.get("content"):
                result["content"] = detail["content"]
            # 稍微放慢，避免太猛
            time.sleep(0.2)

        results.append(result)

    return results



def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--with-detail", action="store_true", default=True)
    parser.add_argument("--no-detail", action="store_true")
    args = parser.parse_args()

    with_detail = args.with_detail and not args.no_detail

    try:
        html_text = http_get(LIST_URL)
        payload = decode_next_f_payload(html_text)
        items = build_items(payload, args.limit, with_detail)

        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        output = {
            "success": True,
            "source": "python-chainthink-scraper",
            "generatedAt": dt.datetime.now().isoformat(),
            "count": len(items),
            "data": items,
        }
        OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"saved: {OUTPUT_PATH}")
        print(f"count: {len(items)}")
        return 0
    except urllib.error.HTTPError as e:
        print(f"HTTP error: {e.code} {e.reason}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
