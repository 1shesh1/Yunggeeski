# Adds git-aliases.config to this clone's local config (one-time per machine).
$ErrorActionPreference = "Stop"
$top = git rev-parse --show-toplevel 2>$null
if (-not $top) { throw "Run this from inside the repository." }

Set-Location $top
$paths = @(git config --local --get-all include.path 2>$null)
if ($paths -notcontains '../git-aliases.config') {
  git config --local --add include.path ../git-aliases.config
}

Write-Host "Installed local git aliases: git cm (commit all), git pr (push + open PR)."
Write-Host "Git does not allow a safe alias named commit that runs git commit; use git cm instead."
