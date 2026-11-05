param(
    [Parameter(Mandatory = $true)]
    [string]$Target,

    [string]$StandardRoot = $null
)

$ErrorActionPreference = 'Stop'

$failures = New-Object System.Collections.Generic.List[string]
$infoMessages = New-Object System.Collections.Generic.List[string]

function Write-Pass {
    param([string]$Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Message)
    $script:failures.Add($Message) | Out-Null
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    $script:infoMessages.Add($Message) | Out-Null
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Resolve-Directory {
    param(
        [string]$Path,
        [string]$Name
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "$Name directory does not exist: $Path"
    }

    return (Resolve-Path -LiteralPath $Path).Path
}

function Get-TargetPath {
    param([string]$RelativePath)
    return Join-Path $TargetRoot $RelativePath
}

function Get-StandardPath {
    param([string]$RelativePath)
    return Join-Path $ResolvedStandardRoot $RelativePath
}

function Get-TargetText {
    param([string]$RelativePath)
    return Get-Content -LiteralPath (Get-TargetPath $RelativePath) -Raw -Encoding UTF8
}

function Get-DisplayPath {
    param([string]$AbsolutePath)

    if ($AbsolutePath.StartsWith($TargetRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        $relative = $AbsolutePath.Substring($TargetRoot.Length).TrimStart('\', '/')
        return ($relative -replace '\\', '/')
    }

    return ($AbsolutePath -replace '\\', '/')
}

function Require-File {
    param([string]$RelativePath)

    $path = Get-TargetPath $RelativePath

    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Write-Fail "$RelativePath is missing."
        return
    }

    if ((Get-Item -LiteralPath $path).Length -le 0) {
        Write-Fail "$RelativePath is empty."
        return
    }

    Write-Pass "$RelativePath exists."
}

function Require-ReadmePattern {
    param(
        [string]$Pattern,
        [string]$Message
    )

    if ($ReadmeText -match $Pattern) {
        Write-Pass $Message
    }
    else {
        Write-Fail $Message
    }
}

function Require-NoMatchInDirectory {
    param(
        [string]$RelativeDirectory,
        [string]$Pattern,
        [string]$Message
    )

    $path = Get-TargetPath $RelativeDirectory

    if (-not (Test-Path -LiteralPath $path -PathType Container)) {
        Write-Info "$RelativeDirectory is not present; skipping this boundary check."
        return
    }

    $sourceExtensions = @('.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte')
    $matchedFiles = Get-ChildItem -LiteralPath $path -Recurse -File |
        Where-Object { $_.FullName -notmatch '[/\\](\.git|node_modules|dist|build|coverage|\.next)[/\\]' } |
        Where-Object { $sourceExtensions -contains $_.Extension.ToLowerInvariant() } |
        ForEach-Object {
            $content = Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if ($content -match $Pattern) {
                Get-DisplayPath $_.FullName
            }
        }

    if ($matchedFiles) {
        Write-Fail "$Message Found in: $($matchedFiles -join ', ')"
    }
    else {
        Write-Pass $Message
    }
}

function Test-TargetHasSourceCode {
    $sourceExtensions = @('.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte')

    $sourceFiles = Get-ChildItem -LiteralPath $TargetRoot -Recurse -File |
        Where-Object { $_.FullName -notmatch '[/\\](\.git|node_modules|dist|build|coverage|\.next)[/\\]' } |
        Where-Object { $sourceExtensions -contains $_.Extension.ToLowerInvariant() }

    return [bool]$sourceFiles
}

function Get-ReadmeValue {
    param(
        [string[]]$Patterns,
        [string]$ValueName
    )

    foreach ($pattern in $Patterns) {
        $match = [regex]::Match($ReadmeText, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
        if ($match.Success) {
            return $match.Groups['value'].Value.Trim().Trim('`')
        }
    }

    Write-Fail "README.md does not declare $ValueName in a supported format."
    return $null
}

try {
    if ([string]::IsNullOrWhiteSpace($StandardRoot)) {
        $scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
        $StandardRoot = Join-Path $scriptDirectory '..'
    }

    $TargetRoot = Resolve-Directory $Target 'Target'
    $ResolvedStandardRoot = Resolve-Directory $StandardRoot 'Standard root'
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Validating repository at: $TargetRoot"
Write-Host "Using standard root: $ResolvedStandardRoot"
Write-Host ""

$standardProfilesPath = Get-StandardPath 'Repository-Profiles.md'
$standardChecklistPath = Get-StandardPath 'Standard-Compliance-Checklist.md'

if (Test-Path -LiteralPath $standardProfilesPath -PathType Leaf) {
    Write-Pass 'Standard root contains Repository-Profiles.md.'
}
else {
    Write-Fail 'Standard root is missing Repository-Profiles.md.'
}

if (Test-Path -LiteralPath $standardChecklistPath -PathType Leaf) {
    Write-Pass 'Standard root contains Standard-Compliance-Checklist.md.'
}
else {
    Write-Fail 'Standard root is missing Standard-Compliance-Checklist.md.'
}

Require-File 'README.md'

if (-not (Test-Path -LiteralPath (Get-TargetPath 'README.md') -PathType Leaf)) {
    Write-Host ""
    Write-Host "Validation failed because README.md is required for repository compliance." -ForegroundColor Red
    exit 1
}

$ReadmeText = Get-TargetText 'README.md'
$allowedProfiles = @(
    'learning-unit',
    'interactive-simulation',
    'shared-library',
    'physics-engine',
    'documentation-only',
    'utility-package'
)

$profile = Get-ReadmeValue @(
    '^\|\s*Repository profile\s*\|\s*(?<value>[^|]+)\|',
    '^Repository profile:\s*(?<value>[a-z-]+)',
    '^Primary profile:\s*(?<value>[a-z-]+)'
) 'a repository profile'

if ($profile) {
    if ($allowedProfiles -contains $profile) {
        Write-Pass "README.md declares supported repository profile '$profile'."
    }
    else {
        Write-Fail "README.md declares unsupported repository profile '$profile'."
    }
}

$standardVersion = Get-ReadmeValue @(
    '^\|\s*Standard version\s*\|\s*(?<value>[^|]+)\|',
    '^Standard version:\s*(?<value>[^\r\n]+)'
) 'a standard version'

if ($standardVersion) {
    if ($standardVersion -match '\b[0-9]+\.[0-9]+\.[0-9]+\b' -or $standardVersion -match '^Not applicable\b') {
        Write-Pass "README.md declares standard version '$standardVersion'."
    }
    else {
        Write-Fail "README.md standard version should be a SemVer value or Not applicable."
    }

    $versionPath = Get-StandardPath 'VERSION.md'
    if (Test-Path -LiteralPath $versionPath -PathType Leaf) {
        $versionText = Get-Content -LiteralPath $versionPath -Raw -Encoding UTF8
        $currentVersionMatch = [regex]::Match($versionText, 'Current version:\s*`(?<version>[^`]+)`')
        if ($currentVersionMatch.Success) {
            $currentVersion = $currentVersionMatch.Groups['version'].Value
            if ($standardVersion -match [regex]::Escape($currentVersion)) {
                Write-Pass "README.md standard version matches current standard version $currentVersion."
            }
            elseif ($standardVersion -match '^Not applicable\b') {
                Write-Info "README.md marks standard version as Not applicable."
            }
            else {
                Write-Info "README.md follows $standardVersion; current standard root is $currentVersion."
            }
        }
    }
}

$complianceStatus = Get-ReadmeValue @(
    '^\|\s*Compliance status\s*\|\s*(?<value>[^|]+)\|',
    '^Compliance status:\s*(?<value>[^\r\n]+)'
) 'a compliance status'

if ($complianceStatus) {
    if ($complianceStatus -match '^(Not assessed|Compliant|Conditionally compliant|Not compliant)\b') {
        Write-Pass "README.md declares compliance status '$complianceStatus'."
    }
    else {
        Write-Fail "README.md compliance status should be Not assessed, Compliant, Conditionally compliant, or Not compliant."
    }
}

Require-ReadmePattern 'physics-learning-standard' 'README.md references physics-learning-standard.'
Require-ReadmePattern '(?im)^\|\s*Maintainer\s*\|' 'README.md identifies maintainer or owner information.'
Require-ReadmePattern '(?im)^# .*Project Summary|^# .*Purpose|^# .*Overview' 'README.md includes a project summary, purpose, or overview section.'
Require-ReadmePattern '(?im)^# .*Project Structure|^# .*Repository Structure|^# .*Main Files|^# .*Structure' 'README.md documents repository structure or main files.'
Require-ReadmePattern '(?im)^# .*Validate|^# .*Validation|## Validate|## Validation' 'README.md documents validation evidence or validation commands.'
Require-ReadmePattern '(?im)^# .*License|## License|\bLicense\b' 'README.md documents license or license decision.'

if ($profile) {
    switch ($profile) {
        'learning-unit' {
            Require-ReadmePattern '(?im)Learning Objectives' 'learning-unit README documents learning objectives.'
            Require-ReadmePattern '(?im)Physics Scope|Concepts|Key Formulas' 'learning-unit README documents physics scope.'
            Require-ReadmePattern '(?im)Learning Features|Practice Activities|Assessment' 'learning-unit README documents learning features.'
        }
        'interactive-simulation' {
            Require-ReadmePattern '(?im)Simulation' 'interactive-simulation README documents simulation purpose or scope.'
            Require-ReadmePattern '(?im)Physics model|Physics Scope|Assumptions' 'interactive-simulation README documents the physics model or assumptions.'
            Require-ReadmePattern '(?im)Controls|Inputs|User controls' 'interactive-simulation README documents controls or inputs.'
        }
        'shared-library' {
            Require-ReadmePattern '(?im)Public API|API|Exports' 'shared-library README documents public API.'
            Require-ReadmePattern '(?im)Usage|Examples' 'shared-library README documents usage examples.'
        }
        'physics-engine' {
            Require-ReadmePattern '(?im)Physics model|Supported formulas|Physics Scope' 'physics-engine README documents physics model or formula scope.'
            Require-ReadmePattern '(?im)Constants|Units|Tolerance' 'physics-engine README documents constants, units, or tolerance.'
            Require-ReadmePattern '(?im)Public API|API|Usage' 'physics-engine README documents API or usage.'
        }
        'documentation-only' {
            Require-ReadmePattern '(?im)Document Index|Standards Overview|Index|Scope' 'documentation-only README documents an index or scope.'
            Require-ReadmePattern '(?im)Governance|Versioning|Changelog|Decision' 'documentation-only README documents governance when applicable.'
        }
        'utility-package' {
            Require-ReadmePattern '(?im)Commands|Usage|How to Run' 'utility-package README documents commands or usage.'
            Require-ReadmePattern '(?im)Inputs|Outputs|Validation behavior' 'utility-package README documents inputs, outputs, or validation behavior.'
            Require-ReadmePattern '(?im)Safety|Destructive|read-only|guard' 'utility-package README documents safety behavior.'
        }
    }
}

$forbiddenPhysicsPattern = '\b(document|window|HTMLElement|CanvasRenderingContext2D|localStorage|sessionStorage|fetch)\b'
$forbiddenApplicationPattern = '\b(document|window|HTMLElement|CanvasRenderingContext2D|localStorage|sessionStorage)\b'

Require-NoMatchInDirectory 'src/physics' $forbiddenPhysicsPattern 'src/physics avoids DOM, Canvas, storage, and network APIs.'
Require-NoMatchInDirectory 'src/application' $forbiddenApplicationPattern 'src/application avoids DOM, Canvas, and concrete browser storage APIs.'

if ($profile -eq 'physics-engine') {
    Require-NoMatchInDirectory 'src' $forbiddenPhysicsPattern 'physics-engine src avoids browser, storage, rendering, and network APIs.'
}

if ((Test-TargetHasSourceCode) -and -not (Test-Path -LiteralPath (Get-TargetPath 'src/physics') -PathType Container)) {
    Require-ReadmePattern '(?im)simple structure|simple repository|architecture exception|separated conceptually' 'README.md documents architecture separation for source code without src/physics.'
}

Write-Host ""

if ($failures.Count -gt 0) {
    Write-Host "Repository validation failed with $($failures.Count) issue(s):" -ForegroundColor Red
    foreach ($failure in $failures) {
        Write-Host "- $failure" -ForegroundColor Red
    }
    exit 1
}

Write-Host 'Repository validation passed. No blocking issues found.' -ForegroundColor Green
exit 0
