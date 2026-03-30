import re

content = open(r'E:\test\src\store\exchange.js', 'r', encoding='utf-8').read()

# EXCHANGE_DESCRIPTIONS keys (inside applyInlineDescriptions, unquoted keys)
desc_section = re.search(r'applyInlineDescriptions\(\)\s*\{.*?EXCHANGE_DESCRIPTIONS\s*=\s*\{(.*?)\n\s{2}\}', content, re.DOTALL)
desc_keys = re.findall(r'^\s{2}([a-z_]+):', desc_section.group(1) if desc_section else '', re.MULTILINE)
desc_keys = sorted(set(desc_keys))
print('EXCHANGE_DESCRIPTIONS keys ({})'.format(len(desc_keys)))
for k in desc_keys:
    print(' ', k)

# EXCHANGE_INFO_ZH keys - find top-level object keys
info_section = re.search(r'EXCHANGE_INFO_ZH\s*=\s*\{(.*?)\n\}', content, re.DOTALL)
info_keys = re.findall(r'^\s{2}([a-z_]+):\s*\{', info_section.group(1) if info_section else '', re.MULTILINE)
info_keys = sorted(set(info_keys))
print()
print('EXCHANGE_INFO_ZH keys ({})'.format(len(info_keys)))
for k in info_keys:
    print(' ', k)

# Compare
desc_only = sorted(set(desc_keys) - set(info_keys))
info_only = sorted(set(info_keys) - set(desc_keys))
common = sorted(set(desc_keys) & set(info_keys))

print()
print('In DESCRIPTIONS but NOT in INFO_ZH:')
for k in desc_only:
    print(' ', k)

print()
print('In INFO_ZH but NOT in DESCRIPTIONS:')
for k in info_only:
    print(' ', k)

print()
print('In BOTH ({}) - MATCH OK:'.format(len(common)))
for k in common:
    print(' ', k)
