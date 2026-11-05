# Version

> Version information for the Physics Learning Standard.

Current version: `1.13.0`

Status: Active standard baseline

Effective date: 2026-08-02

---

# Purpose

This document identifies the current approved version of the Physics Learning Standard.

Repositories in the Physics Learning Ecosystem should reference this version when aligning their structure, documentation, architecture, and development practices.

---

# Versioning Scheme

This repository follows Semantic Versioning.

```text
MAJOR.MINOR.PATCH
```

## MAJOR

Increment the MAJOR version when a standard change breaks existing repository expectations.

Examples:

- Changing the required architecture model.
- Replacing the standard source folder layout.
- Renaming required standard documents.
- Removing a required rule that repositories already depend on.

## MINOR

Increment the MINOR version when adding new standards or significant new guidance without breaking existing repositories.

Examples:

- Adding a new standard document.
- Adding a new repository profile.
- Adding new recommended validation requirements.
- Extending an existing standard with compatible guidance.

## PATCH

Increment the PATCH version for clarifications, corrections, formatting fixes, and documentation improvements that do not change expectations.

Examples:

- Correcting broken document references.
- Clarifying existing wording.
- Fixing diagrams or examples.
- Updating templates without changing required behavior.

---

# Release Requirements

Before updating the version, maintainers should verify that:

- The reason for the change is documented.
- Affected standard documents are updated.
- `CHANGELOG.md` records the change.
- Significant architectural or cross-repository decisions are recorded in `adr/`.
- README and related references remain accurate.
- The change preserves the principles defined in `Principles.md`.

---

# Compatibility

Repositories should document which version of `physics-learning-standard` they follow.

If a repository cannot follow the current standard version, it should document:

- The standard version it follows.
- Which rules are not applicable.
- The reason for each exception.

---

# Current Baseline

Version `1.0.0` establishes the initial standard baseline for:

- Engineering principles
- Domain-Centric Architecture
- Repository and source folder structure
- Coding standards
- Naming conventions
- Canvas guidelines
- UI guidelines
- Formula display guidelines
- Accessibility guidelines
- AI agent rules
- README template
- Decision record process
- Repository license scope

Version `1.1.0` adds profile-based compliance governance for:

- Repository profile selection
- Universal compliance checks
- Profile-specific compliance checks
- Compliance result labels
- Evidence reporting for compliance reviews

Version `1.2.0` adds architecture enforcement guidance for:

- Dependency direction rules
- Layer responsibility rules
- Forbidden Physics Domain dependencies
- Adapter boundary rules
- Simple repository architecture exceptions
- Architecture review checklist

Version `1.3.0` adds physics domain standards for:

- Scientific correctness
- SI units and notation
- Formula and symbol consistency
- Constants and approximation documentation
- Simulation model documentation
- Numerical tolerance
- Dynamic question validation
- Randomness and input constraints

Version `1.4.0` adds validation workflow and automation for:

- Standard repository validation
- Lightweight automated consistency checks
- Validation reporting expectations
- ADR index checks
- Version and README template consistency checks
- Markdown code fence checks
- Obsolete reference checks
- Clear separation between automated checks and human review

Version `1.5.0` adds dynamic quiz system rules for:

- Roll-number based parameter generation
- Non-deterministic random base values
- Attempt-scoped determinism
- On-the-fly validation
- No static hardcoded production answers
- Safety constraints
- Answer tolerance and unit handling
- Worked solution generation
- Dynamic quiz architecture boundaries

Version `1.6.0` adds timed exam system rules for:

- Scored and timed exam metadata
- Exam start screen pattern
- Learner identity fields
- Timer and auto-submit behavior
- Refresh, tab-switch, focus-loss, and lock behavior
- Numerical answer display and tolerance expectations
- Scoring architecture boundaries
- Assessment session result data schema

Version `1.7.0` standardizes high-school gravitational acceleration learning guidance for:

- Default learning approximation `g = 10 m/s^2` near Earth's surface.
- Documented precision-focused exceptions when a repository needs a more precise value.
- Consistent constants guidance across physics standards, units and notation, simulation examples, and README templates.

Version `1.7.1` reduces duplicate guidance without changing repository expectations:

- Shortened repeated relationship sections by using `README.md` as the full standards index.
- Replaced repeated adapter-layer diagrams in Canvas, UI, and Formula standards with references to the canonical architecture documents.
- Preserved adjacent-standard references where they are most useful during review.

Version `1.8.0` adds a reference implementation example for:

- A `learning-unit` repository profile.
- Domain-Centric Architecture using `src/physics/`, `src/application/`, and adapter layers.
- Roll-number based dynamic quiz generation and attempt-scoped validation.
- Timed exam start screen, scoring coordination, and assessment session data shape.
- Physics Domain and application-level tests.

Version `1.9.0` adds dynamic quiz generation fallback strategy guidance for:

- `maxRetries` and documented regeneration limits.
- Retry exhaustion behavior before showing a question.
- Respectful learner-facing generation failure messages.
- Review logging fields for failed generated candidates.
- Timed exam coordination so generation failures happen before timers and submissions.

Version `1.10.0` adds timed exam interruption recovery guidance for:

- Local persistence scope for in-progress timed or scored attempts.
- Recovery flow after refresh, browser return, offline mode, or interrupted sessions.
- Timer continuity based on the original start timestamp.
- Submission sync or export status labels such as `local-only`, `pending-sync`, and `sync-failed`.
- Optional assessment session schema fields for recovery timestamps, recovery action, and sync status.

Version `1.11.0` adds implementation support examples for:

- Reusable contract-test templates for Physics Domain formula behavior.
- Reusable contract-test templates for dynamic question generation and attempt consistency.
- Reusable contract-test templates for numerical answer validation and tolerance behavior.
- Profile-specific README examples for `interactive-simulation`, `shared-library`, `physics-engine`, `documentation-only`, and `utility-package` repositories.
- Template references that help child repositories choose the right example without treating examples as production logic.

Version `1.12.0` adds automation and token-efficiency support for:

- Read-only child repository validation through `scripts/validate-repository.ps1`.
- Basic README profile, standard version, compliance status, maintainer, structure, validation, and license checks for child repositories.
- Basic architecture boundary checks for `src/physics/`, `src/application/`, and strict `physics-engine` repositories.
- Script usage documentation in `scripts/README.md`.
- An AI document selection matrix in `AGENTS.md` to reduce unnecessary standards reading while preserving task-specific coverage.

Version `1.13.0` adds expanded governance guidance for:

- Thai-English internationalization, localization, locale formatting, and UTF-8 encoding expectations.
- Learner data privacy, input handling, assessment integrity, local storage, export, submission, and secrets handling.
- Performance expectations for simulations, Canvas rendering, dynamic generation, assets, and assessment submission.
- Updated repository templates, compliance checks, AI agent reading rules, validation checks, and ADR records for the new governance areas.
