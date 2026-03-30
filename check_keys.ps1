$lines = [System.IO.File]::ReadAllLines('E:\test\src\store\exchange.js', [System.Text.Encoding]::UTF8)

$inDesc = $false
$descKeys = @()
$inInfo = $false
$infoKeys = @()

foreach ($line in $lines) {
    if ($line -match 'EXCHANGE_DESCRIPTIONS\s*=\s*\{') { $inDesc = $true }
    elseif ($line -match 'EXCHANGE_INFO_ZH\s*=\s*\{') { $inInfo = $true }
    elseif ($inDesc -and $line -match '^\s{2}\}' ) { $inDesc = $false }
    elseif ($inInfo -and $line -match '^\s{2}\}' ) { $inInfo = $false }
    elseif ($inDesc -and $line -match '^\s{1,2}([a-z_]+):') {
        $m = [regex]::Match($line, '^\s{1,2}([a-z_]+):')
        $descKeys += $m.Groups[1].Value
    }
    elseif ($inInfo -and $line -match '^\s{2}([a-z_]+):\s*\{') {
        $m = [regex]::Match($line, '^\s{2}([a-z_]+):')
        $infoKeys += $m.Groups[1].Value
    }
}

$descKeys = $descKeys | Sort-Object -Unique
$infoKeys = $infoKeys | Sort-Object -Unique

Write-Host "EXCHANGE_DESCRIPTIONS keys ($($descKeys.Count)):"
$descKeys | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "EXCHANGE_INFO_ZH keys ($($infoKeys.Count)):"
$infoKeys | ForEach-Object { Write-Host "  $_" }

$descOnly = $descKeys | Where-Object { $_ -notin $infoKeys }
$infoOnly = $infoKeys | Where-Object { $_ -notin $descKeys }
$common = $descKeys | Where-Object { $_ -in $infoKeys }

Write-Host ""
Write-Host "In DESCRIPTIONS but NOT in INFO_ZH ($($descOnly.Count)):"
$descOnly | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "In INFO_ZH but NOT in DESCRIPTIONS ($($infoOnly.Count)):"
$infoOnly | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "In BOTH ($($common.Count)) - MATCH:"
$common | ForEach-Object { Write-Host "  $_" }
