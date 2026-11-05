param(
    [string]$Root = $null
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($Root)) {
    $scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
    $Root = (Resolve-Path (Join-Path $scriptDirectory '..')).Path
}
else {
    $Root = (Resolve-Path -LiteralPath $Root).Path
}

$failures = New-Object System.Collections.Generic.List[string]

function Write-Pass {
    param([string]$Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Message)
    $script:failures.Add($Message) | Out-Null
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Get-Text {
    param([string]$RelativePath)
    $path = Join-Path $Root $RelativePath
    return Get-Content -LiteralPath $path -Raw -Encoding UTF8
}

function Require-File {
    param([string]$RelativePath)

    $path = Join-Path $Root $RelativePath

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

function Require-Directory {
    param([string]$RelativePath)

    $path = Join-Path $Root $RelativePath

    if (Test-Path -LiteralPath $path -PathType Container) {
        Write-Pass "$RelativePath directory exists."
    }
    else {
        Write-Fail "$RelativePath directory is missing."
    }
}

function Require-Contains {
    param(
        [string]$RelativePath,
        [string]$Pattern,
        [string]$Message
    )

    $text = Get-Text $RelativePath

    if ($text -match $Pattern) {
        Write-Pass $Message
    }
    else {
        Write-Fail $Message
    }
}

function Require-NoMatch {
    param(
        [string]$Pattern,
        [string]$Message
    )

    $matches = Get-ChildItem -LiteralPath $Root -Recurse -File |
        Where-Object { $_.FullName -notmatch '\\.git\\' } |
        ForEach-Object {
            $content = Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if ($content -match $Pattern) {
                $_.FullName
            }
        }

    if ($matches) {
        Write-Fail "$Message Found in: $($matches -join ', ')"
    }
    else {
        Write-Pass $Message
    }
}

function Require-NoMatchInDirectory {
    param(
        [string]$RelativeDirectory,
        [string]$Pattern,
        [string]$Message
    )

    $path = Join-Path $Root $RelativeDirectory

    if (-not (Test-Path -LiteralPath $path -PathType Container)) {
        Write-Fail "$RelativeDirectory directory is missing."
        return
    }

    $matches = Get-ChildItem -LiteralPath $path -Recurse -File |
        ForEach-Object {
            $content = Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if ($content -match $Pattern) {
                $_.FullName
            }
        }

    if ($matches) {
        Write-Fail "$Message Found in: $($matches -join ', ')"
    }
    else {
        Write-Pass $Message
    }
}

Write-Host "Validating Physics Learning Standard at: $Root"
Write-Host ""

$requiredFiles = @(
    'README.md',
    'VERSION.md',
    'CHANGELOG.md',
    'Principles.md',
    'Architecture.md',
    'Architecture-Enforcement.md',
    'Folder-Structure.md',
    'Repository-Profiles.md',
    'Standard-Compliance-Checklist.md',
    'Physics-Standards.md',
    'Units-and-Notation.md',
    'Simulation-Standards.md',
    'Dynamic-Quiz-System-Rules.md',
    'Timed-Exam-System-Rules.md',
    'Internationalization-and-Localization.md',
    'Security-and-Privacy.md',
    'Performance-Standards.md',
    'Validation-Workflow.md',
    'README-Template.md',
    'Coding-Standards.md',
    'Naming-Conventions.md',
    'Canvas-Guidelines.md',
    'UI-Guidelines.md',
    'Formula-Display.md',
    'Accessibility.md',
    'AI-Agent-Rules.md',
    'AGENTS.md',
    'Decision-Records.md',
    'LICENSE',
    'schemas/assessment-session.schema.json',
    'scripts/README.md',
    'scripts/validate-standard.ps1',
    'scripts/validate-repository.ps1',
    'adr/README.md',
    'adr/0001-adopt-domain-centric-architecture.md',
    'adr/0002-define-repository-profiles-and-compliance.md',
    'adr/0003-define-architecture-enforcement-rules.md',
    'adr/0004-define-physics-domain-standards.md',
    'adr/0005-define-validation-workflow.md',
    'adr/0006-define-dynamic-quiz-system-rules.md',
    'adr/0007-define-timed-exam-system-rules.md',
    'adr/0008-standardize-high-school-gravity-approximation.md',
    'adr/0009-add-reference-implementation-example.md',
    'adr/0010-define-dynamic-quiz-fallback-strategy.md',
    'adr/0011-define-timed-exam-interruption-recovery.md',
    'adr/0012-add-implementation-support-examples.md',
    'adr/0013-add-child-repository-validation-and-agent-decision-matrix.md',
    'adr/0014-add-expanded-governance-guidance.md',
    'examples/physics-unit-example/README.md',
    'examples/physics-unit-example/package.json',
    'examples/physics-unit-example/index.html',
    'examples/physics-unit-example/style.css',
    'examples/physics-unit-example/src/physics/constants.js',
    'examples/physics-unit-example/src/physics/mechanics.js',
    'examples/physics-unit-example/src/physics/dynamic-quiz.js',
    'examples/physics-unit-example/src/application/exam-config.js',
    'examples/physics-unit-example/src/application/exam-session.js',
    'examples/physics-unit-example/src/adapters/ui/main.js',
    'examples/physics-unit-example/src/adapters/storage/attempt-storage.js',
    'examples/physics-unit-example/tests/physics-domain.test.mjs',
    'examples/physics-unit-example/tests/exam-session.test.mjs',
    'examples/test-templates/README.md',
    'examples/test-templates/package.json',
    'examples/test-templates/contracts/test-helpers.mjs',
    'examples/test-templates/contracts/physics-domain-contract.mjs',
    'examples/test-templates/contracts/dynamic-question-contract.mjs',
    'examples/test-templates/contracts/answer-validation-contract.mjs',
    'examples/test-templates/fixtures/example-physics-domain-subject.mjs',
    'examples/test-templates/fixtures/example-dynamic-question-subject.mjs',
    'examples/test-templates/fixtures/example-answer-validation-subject.mjs',
    'examples/test-templates/tests/physics-domain-contract.test.mjs',
    'examples/test-templates/tests/dynamic-question-contract.test.mjs',
    'examples/test-templates/tests/answer-validation-contract.test.mjs',
    'examples/readme-profile-examples/README.md',
    'examples/readme-profile-examples/interactive-simulation-readme.md',
    'examples/readme-profile-examples/shared-library-readme.md',
    'examples/readme-profile-examples/physics-engine-readme.md',
    'examples/readme-profile-examples/documentation-only-readme.md',
    'examples/readme-profile-examples/utility-package-readme.md'
)

foreach ($file in $requiredFiles) {
    Require-File $file
}

Require-Directory 'adr'
Require-Directory 'schemas'
Require-Directory 'scripts'
Require-Directory 'examples'
Require-Directory 'examples/physics-unit-example'
Require-Directory 'examples/physics-unit-example/src/physics'
Require-Directory 'examples/physics-unit-example/src/application'
Require-Directory 'examples/physics-unit-example/src/adapters/ui'
Require-Directory 'examples/physics-unit-example/src/adapters/storage'
Require-Directory 'examples/physics-unit-example/tests'
Require-Directory 'examples/test-templates'
Require-Directory 'examples/test-templates/contracts'
Require-Directory 'examples/test-templates/fixtures'
Require-Directory 'examples/test-templates/tests'
Require-Directory 'examples/readme-profile-examples'

$versionText = Get-Text 'VERSION.md'
$versionMatch = [regex]::Match($versionText, 'Current version:\s*`(?<version>[^`]+)`')

if ($versionMatch.Success) {
    $currentVersion = $versionMatch.Groups['version'].Value
    Write-Pass "VERSION.md declares current version $currentVersion."
}
else {
    $currentVersion = $null
    Write-Fail 'VERSION.md does not declare Current version in the expected format.'
}

$templateText = Get-Text 'README-Template.md'
$templateMatch = [regex]::Match($templateText, 'Template version:\s*(?<version>[0-9]+\.[0-9]+\.[0-9]+)')

if ($templateMatch.Success) {
    $templateVersion = $templateMatch.Groups['version'].Value
    Write-Pass "README-Template.md declares template version $templateVersion."
}
else {
    $templateVersion = $null
    Write-Fail 'README-Template.md does not declare Template version in the expected format.'
}

if ($currentVersion -and $templateVersion) {
    if ($currentVersion -eq $templateVersion) {
        Write-Pass 'README template version matches current standard version.'
    }
    else {
        Write-Fail "README template version ($templateVersion) does not match current standard version ($currentVersion)."
    }
}

if ($currentVersion) {
    $escapedVersion = [regex]::Escape($currentVersion)
    Require-Contains 'CHANGELOG.md' "# $escapedVersion - \d{4}-\d{2}-\d{2}" "CHANGELOG.md contains the current version entry."
    Require-Contains 'README.md' "v$escapedVersion" "README.md contains the current version example."
    Require-Contains 'VERSION.md' ('Version `' + $escapedVersion + '`') "VERSION.md contains the current baseline description."
}

$readmeTemplateHeadings = [regex]::Matches($templateText, '(?m)^# [0-9]+\.').Count
if ($readmeTemplateHeadings -eq 10) {
    Write-Pass 'README-Template.md keeps the 10 required numbered sections.'
}
else {
    Write-Fail "README-Template.md has $readmeTemplateHeadings numbered sections; expected 10."
}

$coreDocs = @(
    'Principles.md',
    'Architecture.md',
    'Architecture-Enforcement.md',
    'Folder-Structure.md',
    'Repository-Profiles.md',
    'Standard-Compliance-Checklist.md',
    'Physics-Standards.md',
    'Units-and-Notation.md',
    'Simulation-Standards.md',
    'Dynamic-Quiz-System-Rules.md',
    'Timed-Exam-System-Rules.md',
    'Internationalization-and-Localization.md',
    'Security-and-Privacy.md',
    'Performance-Standards.md',
    'Validation-Workflow.md',
    'README-Template.md',
    'Coding-Standards.md',
    'Naming-Conventions.md',
    'Canvas-Guidelines.md',
    'UI-Guidelines.md',
    'Formula-Display.md',
    'Accessibility.md',
    'AI-Agent-Rules.md',
    'Decision-Records.md'
)

foreach ($doc in $coreDocs) {
    Require-Contains 'README.md' ([regex]::Escape($doc)) "README.md references $doc."
}

Require-Contains 'README.md' 'scripts/validate-standard\.ps1' 'README.md references the standard validation script.'
Require-Contains 'README.md' 'scripts/validate-repository\.ps1' 'README.md references the child repository validation script.'
Require-Contains 'README.md' 'scripts/README\.md' 'README.md references script usage documentation.'
Require-Contains 'AGENTS.md' 'Validation-Workflow\.md' 'AGENTS.md references Validation-Workflow.md.'
Require-Contains 'AGENTS.md' 'Dynamic-Quiz-System-Rules\.md' 'AGENTS.md references Dynamic-Quiz-System-Rules.md.'
Require-Contains 'AGENTS.md' 'Timed-Exam-System-Rules\.md' 'AGENTS.md references Timed-Exam-System-Rules.md.'
Require-Contains 'AGENTS.md' 'Internationalization-and-Localization\.md' 'AGENTS.md references Internationalization-and-Localization.md.'
Require-Contains 'AGENTS.md' 'Security-and-Privacy\.md' 'AGENTS.md references Security-and-Privacy.md.'
Require-Contains 'AGENTS.md' 'Performance-Standards\.md' 'AGENTS.md references Performance-Standards.md.'
Require-Contains 'AGENTS.md' 'scripts/validate-standard\.ps1' 'AGENTS.md references the standard validation script.'
Require-Contains 'AGENTS.md' 'Document Selection Matrix' 'AGENTS.md includes the AI document selection matrix.'
Require-Contains 'AI-Agent-Rules.md' 'Validation-Workflow\.md' 'AI-Agent-Rules.md references Validation-Workflow.md.'
Require-Contains 'AI-Agent-Rules.md' 'Dynamic-Quiz-System-Rules\.md' 'AI-Agent-Rules.md references Dynamic-Quiz-System-Rules.md.'
Require-Contains 'AI-Agent-Rules.md' 'Timed-Exam-System-Rules\.md' 'AI-Agent-Rules.md references Timed-Exam-System-Rules.md.'
Require-Contains 'AI-Agent-Rules.md' 'Internationalization-and-Localization\.md' 'AI-Agent-Rules.md references Internationalization-and-Localization.md.'
Require-Contains 'AI-Agent-Rules.md' 'Security-and-Privacy\.md' 'AI-Agent-Rules.md references Security-and-Privacy.md.'
Require-Contains 'AI-Agent-Rules.md' 'Performance-Standards\.md' 'AI-Agent-Rules.md references Performance-Standards.md.'
Require-Contains 'AI-Agent-Rules.md' 'Document Selection Matrix' 'AI-Agent-Rules.md references the document selection matrix.'
Require-Contains 'CONTRIBUTING.md' 'Validation-Workflow\.md' 'CONTRIBUTING.md references Validation-Workflow.md.'
Require-Contains 'Standard-Compliance-Checklist.md' 'Validation-Workflow\.md' 'Standard-Compliance-Checklist.md references Validation-Workflow.md.'
Require-Contains 'Standard-Compliance-Checklist.md' 'Dynamic-Quiz-System-Rules\.md' 'Standard-Compliance-Checklist.md references Dynamic-Quiz-System-Rules.md.'
Require-Contains 'Standard-Compliance-Checklist.md' 'Timed-Exam-System-Rules\.md' 'Standard-Compliance-Checklist.md references Timed-Exam-System-Rules.md.'
Require-Contains 'Standard-Compliance-Checklist.md' 'Internationalization-and-Localization\.md' 'Standard-Compliance-Checklist.md references Internationalization-and-Localization.md.'
Require-Contains 'Standard-Compliance-Checklist.md' 'Security-and-Privacy\.md' 'Standard-Compliance-Checklist.md references Security-and-Privacy.md.'
Require-Contains 'Standard-Compliance-Checklist.md' 'Performance-Standards\.md' 'Standard-Compliance-Checklist.md references Performance-Standards.md.'
Require-Contains 'Standard-Compliance-Checklist.md' 'validate-repository\.ps1' 'Standard-Compliance-Checklist.md references child repository automation preflight.'
Require-Contains 'README-Template.md' '## Validate' 'README-Template.md includes a validation command section.'
Require-Contains 'README-Template.md' 'validate-repository\.ps1' 'README-Template.md references the child repository validation script.'
Require-Contains 'README-Template.md' 'Dynamic-Quiz-System-Rules\.md' 'README-Template.md references Dynamic-Quiz-System-Rules.md.'
Require-Contains 'README-Template.md' 'Timed-Exam-System-Rules\.md' 'README-Template.md references Timed-Exam-System-Rules.md.'
Require-Contains 'README-Template.md' 'Internationalization-and-Localization\.md' 'README-Template.md references Internationalization-and-Localization.md.'
Require-Contains 'README-Template.md' 'Security-and-Privacy\.md' 'README-Template.md references Security-and-Privacy.md.'
Require-Contains 'README-Template.md' 'Performance-Standards\.md' 'README-Template.md references Performance-Standards.md.'
Require-Contains 'README-Template.md' 'schemas/assessment-session\.schema\.json' 'README-Template.md references the assessment session schema.'
Require-Contains 'Physics-Standards.md' 'g = 10 m/s\^2' 'Physics-Standards.md documents g = 10 m/s^2 as the learning approximation.'
Require-Contains 'Units-and-Notation.md' '\| g \|.*\| 10 \| m/s\^2 \|' 'Units-and-Notation.md documents 10 m/s^2 as the recommended learning value for g.'
Require-Contains 'README-Template.md' 'g = 10 m/s\^2' 'README-Template.md includes the high-school gravity approximation guidance.'
Require-NoMatch 'g\s*=\s*9\.8\s*m/s\^2' 'No standard document still recommends the legacy high-school gravity default.'
Require-Contains 'Dynamic-Quiz-System-Rules.md' 'Generation Fallback Strategy' 'Dynamic-Quiz-System-Rules.md defines generation fallback strategy.'
Require-Contains 'Dynamic-Quiz-System-Rules.md' 'maxRetries' 'Dynamic-Quiz-System-Rules.md documents maxRetries.'
Require-Contains 'Dynamic-Quiz-System-Rules.md' 'Retry count and `maxRetries`' 'Dynamic-Quiz-System-Rules.md documents fallback review logging.'
Require-Contains 'Standard-Compliance-Checklist.md' 'Dynamic quiz fallback' 'Standard-Compliance-Checklist.md checks dynamic quiz fallback behavior.'
Require-Contains 'README-Template.md' 'fallback strategy: `maxRetries`' 'README-Template.md includes dynamic quiz fallback guidance.'
Require-Contains 'Timed-Exam-System-Rules.md' 'Offline and Network Failure Strategy' 'Timed-Exam-System-Rules.md defines interruption recovery strategy.'
Require-Contains 'Timed-Exam-System-Rules.md' 'pending-sync' 'Timed-Exam-System-Rules.md documents sync status labels.'
Require-Contains 'Timed-Exam-System-Rules.md' 'original start timestamp' 'Timed-Exam-System-Rules.md preserves timer continuity during recovery.'
Require-Contains 'Timed-Exam-System-Rules.md' 'Security-and-Privacy\.md' 'Timed-Exam-System-Rules.md references security and privacy guidance.'
Require-Contains 'Timed-Exam-System-Rules.md' 'tamper' 'Timed-Exam-System-Rules.md documents client-side tamper limits.'
Require-Contains 'Simulation-Standards.md' 'Performance-Standards\.md' 'Simulation-Standards.md references performance guidance.'
Require-Contains 'Canvas-Guidelines.md' 'Performance-Standards\.md' 'Canvas-Guidelines.md references performance guidance.'
Require-Contains 'Units-and-Notation.md' 'Internationalization-and-Localization\.md' 'Units-and-Notation.md references i18n guidance.'
Require-Contains 'UI-Guidelines.md' 'Internationalization-and-Localization\.md' 'UI-Guidelines.md references i18n guidance.'
Require-Contains 'Accessibility.md' 'Internationalization-and-Localization\.md' 'Accessibility.md references i18n guidance.'
Require-Contains 'Internationalization-and-Localization.md' 'UTF-8' 'Internationalization-and-Localization.md documents UTF-8 encoding.'
Require-Contains 'Security-and-Privacy.md' 'PDPA' 'Security-and-Privacy.md documents PDPA awareness.'
Require-Contains 'Security-and-Privacy.md' 'Do not commit secrets' 'Security-and-Privacy.md documents secrets handling.'
Require-Contains 'Performance-Standards.md' 'Assessment Submission Performance' 'Performance-Standards.md documents assessment submission performance.'
Require-Contains 'Standard-Compliance-Checklist.md' 'Timed exam recovery' 'Standard-Compliance-Checklist.md checks timed exam recovery behavior.'
Require-Contains 'README-Template.md' 'Offline or recovery rule' 'README-Template.md includes timed exam recovery documentation.'
Require-Contains 'schemas/assessment-session.schema.json' '"syncStatus"' 'Assessment session schema includes optional sync status.'
Require-Contains 'README.md' 'examples/physics-unit-example' 'README.md references the reference implementation example.'
Require-Contains 'README.md' 'examples/test-templates' 'README.md references reusable test templates.'
Require-Contains 'README.md' 'examples/readme-profile-examples' 'README.md references profile README examples.'
Require-Contains 'scripts/README.md' 'validate-standard\.ps1' 'scripts/README.md documents the standard validation script.'
Require-Contains 'scripts/README.md' 'validate-repository\.ps1' 'scripts/README.md documents the child repository validation script.'
Require-Contains 'scripts/validate-repository.ps1' 'Repository profile' 'Child repository validator checks README profile evidence.'
Require-Contains 'scripts/validate-repository.ps1' 'Standard version' 'Child repository validator checks standard version evidence.'
Require-Contains 'scripts/validate-repository.ps1' 'src/physics' 'Child repository validator checks Physics Domain boundaries.'
Require-Contains 'Validation-Workflow.md' 'validate-repository\.ps1' 'Validation workflow documents child repository validation.'
Require-Contains 'Validation-Workflow.md' 'Security-and-Privacy' 'Validation workflow references security and privacy review.'
Require-Contains 'Validation-Workflow.md' 'Performance-Standards' 'Validation workflow references performance review.'
Require-Contains 'Validation-Workflow.md' 'Internationalization' 'Validation workflow references internationalization review.'
Require-Contains 'adr/README.md' '0009-add-reference-implementation-example\.md' 'adr/README.md references ADR 0009.'
Require-Contains 'adr/README.md' '0010-define-dynamic-quiz-fallback-strategy\.md' 'adr/README.md references ADR 0010.'
Require-Contains 'adr/README.md' '0011-define-timed-exam-interruption-recovery\.md' 'adr/README.md references ADR 0011.'
Require-Contains 'adr/README.md' '0012-add-implementation-support-examples\.md' 'adr/README.md references ADR 0012.'
Require-Contains 'adr/README.md' '0013-add-child-repository-validation-and-agent-decision-matrix\.md' 'adr/README.md references ADR 0013.'
Require-Contains 'adr/README.md' '0014-add-expanded-governance-guidance\.md' 'adr/README.md references ADR 0014.'
Require-Contains 'examples/physics-unit-example/README.md' 'Repository profile\s*\|\s*learning-unit' 'Reference implementation declares learning-unit profile.'
Require-Contains 'examples/physics-unit-example/README.md' 'Dynamic-Quiz-System-Rules\.md' 'Reference implementation references dynamic quiz rules.'
Require-Contains 'examples/physics-unit-example/README.md' 'Timed-Exam-System-Rules\.md' 'Reference implementation references timed exam rules.'
Require-Contains 'examples/physics-unit-example/README.md' 'Recovery flow' 'Reference implementation documents recovery flow.'
Require-Contains 'examples/physics-unit-example/src/physics/constants.js' 'GRAVITATIONAL_ACCELERATION = 10' 'Reference implementation centralizes g = 10 m/s^2 in the Physics Domain.'
Require-Contains 'examples/physics-unit-example/src/physics/dynamic-quiz.js' 'MAX_GENERATION_RETRIES' 'Reference implementation defines dynamic quiz maxRetries.'
Require-Contains 'examples/physics-unit-example/src/physics/dynamic-quiz.js' 'DynamicQuestionGenerationError' 'Reference implementation rejects exhausted dynamic generation safely.'
Require-Contains 'examples/physics-unit-example/src/application/exam-session.js' 'schemaVersion: "1\.0\.0"' 'Reference implementation emits assessment session schema version.'
Require-Contains 'examples/physics-unit-example/src/application/exam-session.js' 'getRecoveryState' 'Reference implementation derives recovery state in application services.'
Require-Contains 'examples/physics-unit-example/src/adapters/storage/attempt-storage.js' 'saveSubmission' 'Reference implementation stores completed local submissions.'
Require-Contains 'examples/physics-unit-example/src/adapters/ui/main.js' 'restoreSavedAttempt' 'Reference implementation restores saved attempts before starting a new attempt.'
Require-Contains 'examples/physics-unit-example/tests/exam-session.test.mjs' 'expired recovered attempts submit as timeout' 'Reference implementation tests expired recovery timeout behavior.'
Require-NoMatchInDirectory 'examples/physics-unit-example/src/physics' '\b(document|window|HTMLElement|CanvasRenderingContext2D|localStorage|sessionStorage|fetch)\b' 'Reference implementation Physics Domain avoids browser APIs.'
Require-Contains 'README-Template.md' 'examples/test-templates/' 'README-Template.md references reusable test templates.'
Require-Contains 'README-Template.md' 'examples/readme-profile-examples/' 'README-Template.md references profile README examples.'
Require-Contains 'examples/test-templates/README.md' 'not production answer\s+logic' 'Test templates clarify they are not production answer logic.'
Require-Contains 'examples/test-templates/package.json' 'node --test tests/\*\.test\.mjs' 'Test templates expose a runnable Node test command.'
Require-Contains 'examples/test-templates/contracts/physics-domain-contract.mjs' 'definePhysicsDomainContractTests' 'Test templates define a Physics Domain contract.'
Require-Contains 'examples/test-templates/contracts/dynamic-question-contract.mjs' 'defineDynamicQuestionContractTests' 'Test templates define a dynamic question contract.'
Require-Contains 'examples/test-templates/contracts/answer-validation-contract.mjs' 'defineAnswerValidationContractTests' 'Test templates define an answer validation contract.'
Require-Contains 'examples/test-templates/fixtures/example-physics-domain-subject.mjs' 'g' 'Test templates include a documented physics-domain fixture.'
Require-Contains 'examples/test-templates/fixtures/example-dynamic-question-subject.mjs' 'maxRetries' 'Test templates include exhausted dynamic generation behavior.'
Require-Contains 'examples/test-templates/fixtures/example-answer-validation-subject.mjs' 'tolerance' 'Test templates include numerical tolerance fixture data.'
Require-NoMatchInDirectory 'examples/test-templates/contracts' '\b(document|window|HTMLElement|CanvasRenderingContext2D|localStorage|sessionStorage|fetch)\b' 'Test template contracts avoid browser APIs.'
Require-NoMatchInDirectory 'examples/test-templates/fixtures' '\b(document|window|HTMLElement|CanvasRenderingContext2D|localStorage|sessionStorage|fetch)\b' 'Test template fixtures avoid browser APIs.'
Require-Contains 'examples/readme-profile-examples/README.md' 'interactive-simulation-readme\.md' 'Profile README examples index interactive-simulation example.'
Require-Contains 'examples/readme-profile-examples/interactive-simulation-readme.md' 'Repository profile\s*\|\s*interactive-simulation' 'Interactive simulation README example declares its profile.'
Require-Contains 'examples/readme-profile-examples/shared-library-readme.md' 'Repository profile\s*\|\s*shared-library' 'Shared library README example declares its profile.'
Require-Contains 'examples/readme-profile-examples/physics-engine-readme.md' 'Repository profile\s*\|\s*physics-engine' 'Physics engine README example declares its profile.'
Require-Contains 'examples/readme-profile-examples/documentation-only-readme.md' 'Repository profile\s*\|\s*documentation-only' 'Documentation-only README example declares its profile.'
Require-Contains 'examples/readme-profile-examples/utility-package-readme.md' 'Repository profile\s*\|\s*utility-package' 'Utility-package README example declares its profile.'

try {
    Get-Text 'schemas/assessment-session.schema.json' | ConvertFrom-Json | Out-Null
    Write-Pass 'Assessment session schema is valid JSON.'
}
catch {
    Write-Fail 'Assessment session schema is not valid JSON.'
}

$adrIndexText = Get-Text 'adr/README.md'
$adrFiles = Get-ChildItem -LiteralPath (Join-Path $Root 'adr') -File |
    Where-Object { $_.Name -match '^[0-9]{4}-.*\.md$' }

foreach ($adr in $adrFiles) {
    if ($adrIndexText -match [regex]::Escape($adr.Name)) {
        Write-Pass "adr/README.md indexes $($adr.Name)."
    }
    else {
        Write-Fail "adr/README.md does not index $($adr.Name)."
    }
}

$markdownFiles = Get-ChildItem -LiteralPath $Root -Recurse -File -Filter '*.md'

foreach ($markdownFile in $markdownFiles) {
    $content = Get-Content -LiteralPath $markdownFile.FullName -Raw -Encoding UTF8
    $fenceCount = [regex]::Matches($content, '```').Count

    if (($fenceCount % 2) -eq 0) {
        Write-Pass "Markdown fences are balanced in $($markdownFile.Name)."
    }
    else {
        Write-Fail "Markdown fences are not balanced in $($markdownFile.FullName)."
    }
}

if (Test-Path -LiteralPath (Join-Path $Root 'LICENSE.md')) {
    Write-Fail 'LICENSE.md exists. Use LICENSE without an extension for the standard repository license.'
}
else {
    Write-Pass 'LICENSE uses the expected extensionless filename.'
}

Require-NoMatch 'docs/(Architecture|AI-Agent-Rules|Decision-Records)' 'No obsolete docs/... references remain.'

Write-Host ""

if ($failures.Count -gt 0) {
    Write-Host "Validation failed with $($failures.Count) issue(s):" -ForegroundColor Red
    foreach ($failure in $failures) {
        Write-Host "- $failure" -ForegroundColor Red
    }
    exit 1
}

Write-Host 'Validation passed. No blocking issues found.' -ForegroundColor Green
exit 0
