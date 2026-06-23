# SessionStart hook for superpowers plugin (PowerShell version)
# Injects the "using-superpowers" skill content at the start of every session

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pluginRoot = Resolve-Path "$scriptDir\.."
$usingSuperpowersPath = Join-Path $pluginRoot "skills\using-superpowers\SKILL.md"

if (-not (Test-Path $usingSuperpowersPath)) {
    # Try project-level skills location
    $usingSuperpowersPath = Join-Path $PSScriptRoot "..\skills\using-superpowers\SKILL.md"
}

$usingSuperpowersContent = ""
if (Test-Path $usingSuperpowersPath) {
    $usingSuperpowersContent = Get-Content -Path $usingSuperpowersPath -Raw -Encoding UTF8
} else {
    # Fallback: skills might be in user directory
    $userSkillsPath = "$env:USERPROFILE\.claude\skills\using-superpowers\SKILL.md"
    if (Test-Path $userSkillsPath) {
        $usingSuperpowersContent = Get-Content -Path $userSkillsPath -Raw -Encoding UTF8
    }
}

if ($usingSuperpowersContent) {
    # Escape for JSON embedding
    $escaped = $usingSuperpowersContent -replace '\\', '\\' -replace '"', '\"' -replace "`n", '\n' -replace "`r", '\r' -replace "`t", '\t'

    $sessionContext = "<EXTREMELY_IMPORTANT>`nYou have superpowers.`n`n**Below is the full content of your 'superpowers:using-superpowers' skill - your introduction to using skills. For all other skills, use the 'Skill' tool:**`n`n${escaped}`n</EXTREMELY_IMPORTANT>"

    # Output as JSON in Claude Code hook format
    $output = @{
        hookSpecificOutput = @{
            hookEventName = "SessionStart"
            additionalContext = $sessionContext
        }
    }

    $output | ConvertTo-Json -Depth 3 -Compress
}

exit 0
