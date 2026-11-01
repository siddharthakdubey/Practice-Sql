<#
  Runs a practice answer against its database and compares it with the expected output.

  Usage (from the repo root):
    .\scripts\check.ps1 Q001                 # run practice\set01\answers\Q001.sql and compare
    .\scripts\check.ps1 Q001 -Show           # also print your output
    .\scripts\check.ps1 -BuildExpected       # (maintainer) regenerate expected\*.txt from _solutions

  Server: environment variable SQL_SERVER (default: localhost). Windows authentication is used.
#>
param(
    [string]$Question,
    [switch]$Show,
    [switch]$BuildExpected
)
$ErrorActionPreference = "Stop"
$server = if ($env:SQL_SERVER) { $env:SQL_SERVER } else { "localhost" }
$root = Split-Path -Parent $PSScriptRoot

function Invoke-Sql([string]$file, [string]$db) {
    $tmp = New-TemporaryFile
    try {
        "SET NOCOUNT ON;`n" + (Get-Content -Raw $file) | Set-Content -Encoding UTF8 $tmp
        $out = & sqlcmd -S $server -E -C -d $db -W -s "|" -f 65001 -i $tmp 2>&1
        ($out | ForEach-Object { "$_".TrimEnd() }) -join "`n"
    } finally { Remove-Item $tmp -ErrorAction SilentlyContinue }
}

if ($BuildExpected) {
    Get-ChildItem (Join-Path $root "practice\set*\_solutions\Q*.sql") | ForEach-Object {
        $set = $_.Directory.Parent.FullName
        $db = (Get-Content (Join-Path $set "DB")).Trim()
        $name = $_.BaseName
        New-Item -ItemType Directory -Force (Join-Path $set "expected") | Out-Null
        Invoke-Sql $_.FullName $db | Set-Content -Encoding UTF8 (Join-Path $set "expected\$name.txt")
        "built $name"
    }
    return
}

if (-not $Question) { Write-Host "Usage: .\scripts\check.ps1 Q001 [-Show]"; return }
$ans = Get-ChildItem (Join-Path $root "practice\set*\answers\$Question.sql") -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $ans) { Write-Host "No answer file found: practice\set*\answers\$Question.sql" -ForegroundColor Yellow; return }
$set = $ans.Directory.Parent.FullName
$db = (Get-Content (Join-Path $set "DB")).Trim()
$expectedFile = Join-Path $set "expected\$Question.txt"
$mine = Invoke-Sql $ans.FullName $db
if ($Show) { Write-Host $mine }
$expected = (Get-Content -Raw $expectedFile).TrimEnd() -replace "`r", ""
if ($mine.TrimEnd() -replace "`r", "" -ceq $expected) {
    Write-Host "PASS  $Question" -ForegroundColor Green
} else {
    Write-Host "DIFFERENT  $Question  (same rows, order and column names are required)" -ForegroundColor Red
    Write-Host "--- expected ---"; Write-Host $expected
    if (-not $Show) { Write-Host "--- yours ---"; Write-Host $mine }
}
