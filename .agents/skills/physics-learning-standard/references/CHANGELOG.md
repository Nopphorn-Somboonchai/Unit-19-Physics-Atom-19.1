# Changelog

> History of approved changes to the Physics Learning Standard.

This changelog records changes that affect standards, templates, governance, or repository expectations across the Physics Learning Ecosystem.

---

# Unreleased

Changes planned or proposed for the next version should be listed here before release.

---

# 1.13.0 - 2026-08-02

Added expanded governance guidance for language, privacy, security, and performance.

## Added

- `Internationalization-and-Localization.md` for Thai-English UI language, bilingual labels, locale formatting, and UTF-8 encoding.
- `Security-and-Privacy.md` for learner data, input handling, assessment integrity, local storage, exports, submissions, privacy, and secrets.
- `Performance-Standards.md` for simulation, Canvas, dynamic generation, assets, and assessment submission performance.
- ADR 0014 for the expanded governance guidance decision.
- Standard validation checks for the new governance documents and their cross-references.

## Changed

- Updated `README.md`, `AGENTS.md`, `AI-Agent-Rules.md`, `README-Template.md`, `Repository-Profiles.md`, and `Standard-Compliance-Checklist.md` to include the new governance areas.
- Updated `Timed-Exam-System-Rules.md` with security and privacy review expectations.
- Updated `Simulation-Standards.md` and `Canvas-Guidelines.md` with performance review expectations.
- Updated `UI-Guidelines.md`, `Accessibility.md`, and `Units-and-Notation.md` to reference language and localization guidance.
- Updated reference and profile README examples from `1.12.0` to `1.13.0`.
- Updated version baseline from `1.12.0` to `1.13.0`.

## Governance

- Expanded governance is conditional by repository behavior. Repositories should mark language, security, privacy, or performance items `Not applicable` when they do not apply.
- Security and privacy guidance is not legal advice; it requires explicit learner data handling so schools and maintainers can review risk.

---

# 1.12.0 - 2026-08-02

Added automation and token-efficiency support for child repository review.

## Added

- `scripts/validate-repository.ps1` as a read-only lightweight validator for child repositories.
- `scripts/README.md` with usage notes for standard and child repository validation scripts.
- AI document selection matrix in `AGENTS.md` to help agents choose task-specific standards without loading unrelated documents.
- ADR 0013 for the child repository validation and AI decision matrix decision.
- Standard validation checks for the new child repository validator, script documentation, ADR, and decision matrix.

## Changed

- Updated `Validation-Workflow.md` to document child repository preflight validation.
- Updated `README.md` and `README-Template.md` to reference `validate-repository.ps1`.
- Updated reference and profile README examples from `1.11.0` to `1.12.0`.
- Updated version baseline from `1.11.0` to `1.12.0`.

## Governance

- Child repository automation is a preflight check, not a replacement for profile-based compliance review, physics review, accessibility review, licensing review, or repository-specific tests.
- The AI document selection matrix reduces unnecessary reading while preserving required core and task-specific standards.

---

# 1.11.0 - 2026-08-02

Added implementation support examples for child repositories.

## Added

- `examples/test-templates/` with reusable contract-test examples for Physics Domain formulas, dynamic question generation, and numerical answer validation.
- Runnable example fixtures for contract tests using Node's built-in test runner.
- `examples/readme-profile-examples/` with filled README examples for `interactive-simulation`, `shared-library`, `physics-engine`, `documentation-only`, and `utility-package` repositories.
- ADR 0012 for the implementation support examples decision.
- Validation checks for the new support example folders, contract functions, profile examples, and runnable test templates.

## Changed

- Updated `README.md` to include the new implementation support example folders.
- Updated `README-Template.md` to point child repositories to profile README examples and reusable test templates.
- Updated the reference implementation README standard version from `1.10.0` to `1.11.0`.
- Updated README template version from `1.10.0` to `1.11.0`.
- Updated version baseline from `1.10.0` to `1.11.0`.

## Governance

- Test templates are examples and fixtures, not production answer logic.
- Profile README examples should be adapted to real repository behavior and should not cause maintainers to invent non-applicable learning, assessment, or build details.

---

# 1.10.0 - 2026-08-02

Added a Timed Exam offline and network failure strategy for interrupted attempts.

## Added

- `Offline and Network Failure Strategy` guidance in `Timed-Exam-System-Rules.md`.
- Local persistence expectations for in-progress timed or scored attempts.
- Recovery flow expectations for refresh, browser return, offline mode, network loss, and backend failure.
- Timer continuity guidance so recovered attempts derive remaining time from the original start timestamp.
- Sync and export status labels such as `local-only`, `pending-export`, `pending-sync`, `sync-failed`, and `conflict-review`.
- Optional assessment session schema fields for recovery timestamps, recovery action, sync status, and client clock warnings.
- Compliance checklist items for timed exam recovery behavior.
- README template guidance for documenting offline or recovery behavior.
- ADR 0011 for the timed exam interruption recovery decision.
- Validation checks for the new timed exam recovery guidance and reference implementation behavior.

## Changed

- Updated the reference implementation to demonstrate saved-attempt recovery, draft-answer persistence, expired-attempt timeout submission, and local-only stored submissions.
- Updated README structure and version examples to reflect the current standard baseline.
- Updated README template version from `1.9.0` to `1.10.0`.
- Updated version baseline from `1.9.0` to `1.10.0`.

## Governance

- Timed or scored exams should not silently lose in-progress attempts or completed submissions during refresh, browser close, offline mode, or network failure.
- Assessment status and sync/export status should be tracked separately so scoring remains deterministic while storage state remains reviewable.

---

# 1.9.0 - 2026-08-02

Added a Dynamic Quiz fallback strategy for failed generated parameters.

## Added

- `Generation Fallback Strategy` guidance in `Dynamic-Quiz-System-Rules.md`.
- `maxRetries` expectations for regenerating failed dynamic quiz candidates.
- Retry exhaustion behavior that rejects unsafe generated questions before learners see them.
- Learner-facing error message guidance for generation failures.
- Technical logging or review data guidance for failed generation attempts.
- Compliance checklist items for dynamic quiz fallback behavior.
- README template guidance for documenting dynamic quiz fallback behavior.
- ADR 0010 for the dynamic quiz fallback strategy decision.
- Validation checks for the new fallback strategy guidance and reference implementation.

## Changed

- Updated the reference implementation to demonstrate `maxRetries`, retry logging hooks, and generation failure errors.
- Updated README structure and version examples to reflect the current standard baseline.
- Updated README template version from `1.8.0` to `1.9.0`.
- Updated version baseline from `1.8.0` to `1.9.0`.

## Governance

- Dynamic quiz systems should reject unsafe generated attempts before showing questions.
- If a timed or scored exam includes dynamic generation, fallback should finish before the timer starts so generation failures are system/setup errors, not learner submissions.

---

# 1.8.0 - 2026-08-02

Added a reference implementation example for ecosystem repositories.

## Added

- `examples/physics-unit-example/` as a minimal `learning-unit` reference implementation.
- Example Physics Domain modules for constants, formulas, dynamic parameter generation, numerical answer validation, and worked solutions.
- Example Application Services for timed exam configuration, attempt lifecycle, scoring coordination, and assessment session shaping.
- Example UI and storage adapters that keep browser APIs outside the Physics Domain.
- Tests for Physics Domain behavior, attempt-scoped dynamic values, scoring, timeout handling, and remaining-time calculation.
- ADR 0009 for the reference implementation decision.
- Validation checks for the reference implementation structure and core compliance boundaries.

## Changed

- Updated README documentation to include `examples/`.
- Updated README template version from `1.7.1` to `1.8.0`.
- Updated version baseline from `1.7.1` to `1.8.0`.

## Governance

- The example is a reference implementation, not a production lesson template.
- Child repositories may use the example to understand architecture and assessment boundaries while adapting lesson content, design, storage, and deployment to their own context.

---

# 1.7.1 - 2026-08-02

Reduced repeated guidance across standard documents without changing repository expectations.

## Changed

- Shortened repeated `Relationship to Other Standards` sections by pointing to `README.md` as the full standards index.
- Kept only closest companion standards in individual documents to preserve local navigation.
- Replaced repeated adapter-layer diagrams in Canvas, UI, and Formula standards with references to `Architecture.md` and `Architecture-Enforcement.md`.
- Updated README template version from `1.7.0` to `1.7.1`.
- Updated version baseline from `1.7.0` to `1.7.1`.

## Governance

- This is a documentation-efficiency patch. It does not change architecture, physics, quiz, timed exam, validation, or compliance expectations.

---

# 1.7.0 - 2026-08-02

Standardized high-school gravitational acceleration learning guidance.

## Added

- ADR 0008 for the high-school gravitational acceleration approximation decision.
- README template guidance to document `g = 10 m/s^2` as the default high-school learning approximation when relevant.
- Validation checks for the repository's `g = 10 m/s^2` guidance.

## Changed

- Updated `Physics-Standards.md` to use `g = 10 m/s^2` as the high-school classroom mechanics example.
- Updated `Units-and-Notation.md` to list `g = 10 m/s^2` as the recommended high-school learning value.
- Updated `Simulation-Standards.md` so the numerical tolerance example no longer conflicts with the default learning approximation.
- Updated README structure and version examples to reflect the current standard baseline.
- Updated README template version from `1.6.0` to `1.7.0`.
- Updated version baseline from `1.6.0` to `1.7.0`.

## Governance

- High-school mechanics repositories should use `g = 10 m/s^2` as the default learning approximation near Earth's surface unless they document a precision-focused reason to use a different value.
- Precision-focused repositories may use a more precise gravitational acceleration value when the source, approximation level, and learner-facing rationale are documented.

---

# 1.6.0 - 2026-08-02

Added timed exam system rules.

## Added

- `Timed-Exam-System-Rules.md` for scored and timed exam flow, start screens, identity fields, timer behavior, lock rules, scoring, and submitted result data.
- `schemas/assessment-session.schema.json` as the shared data contract for stored or exported exam sessions.
- ADR 0007 for the timed exam system rules decision.
- Timed exam checks in `Standard-Compliance-Checklist.md`.

## Changed

- Updated README documentation to include timed exam system rules.
- Updated README template to reference timed exam setup and assessment session data.
- Updated AI agent guidance to apply timed exam rules when editing scored assessments, exam start screens, lock behavior, or submitted exam data.
- Updated standard validation to require the timed exam standard, assessment schema, and ADR 0007.
- Updated version baseline from `1.5.0` to `1.6.0`.

## Governance

- Timed or scored exams should document metadata, start-screen rules, learner identity, timing, locking, scoring, and result data behavior before implementation.
- Timed exams that include dynamic or roll-number based questions must also follow `Dynamic-Quiz-System-Rules.md`.

---

# 1.5.0 - 2026-08-01

Added dynamic quiz system rules.

## Added

- `Dynamic-Quiz-System-Rules.md` for roll-number based dynamic quiz generation, on-the-fly validation, safety constraints, tolerance, and worked solution rules.
- ADR 0006 for the dynamic quiz system rules decision.
- Dynamic quiz checks in `Standard-Compliance-Checklist.md`.

## Changed

- Updated README documentation to include dynamic quiz system rules.
- Updated README template to reference dynamic quiz validation and a dedicated validation command section.
- Updated AI agent guidance to apply dynamic quiz rules when editing quizzes, randomized assessments, or roll-number based question systems.
- Updated version baseline from `1.4.0` to `1.5.0`.

## Governance

- Dynamic quizzes should document roll number use, random base ranges, constraints, tolerance, validation, and reproducibility behavior.
- Non-deterministic quiz generation must remain deterministic within a single quiz attempt.

---

# 1.4.0 - 2026-08-01

Added validation workflow and standard repository automation.

## Added

- `Validation-Workflow.md` for standard validation levels, reporting expectations, and human review guidance.
- `scripts/validate-standard.ps1` for lightweight validation of the standard repository.
- ADR 0005 for the validation workflow decision.
- Validation workflow references in README, contribution guidance, AI agent guidance, and the compliance checklist.

## Changed

- Updated README documentation to include validation workflow and the validation script.
- Updated README template to version `1.4.0`.
- Updated AI agent guidance to require validation reporting after standards changes.
- Updated version baseline from `1.3.0` to `1.4.0`.

## Governance

- Standard changes should now run or document validation before completion.
- Automation supports review but does not replace human review for physics correctness, accessibility, licensing, or repository-specific behavior.

---

# 1.3.0 - 2026-08-01

Added physics domain standards.

## Added

- `Physics-Standards.md` for scientific correctness, formula ownership, assumptions, constants, and dynamic question principles.
- `Units-and-Notation.md` for SI units, symbols, formula notation, constants notation, rounding, and bilingual terminology guidance.
- `Simulation-Standards.md` for simulation model documentation, numerical tolerance, randomness, input constraints, validation cases, and motion accessibility.
- ADR 0004 for the physics domain standards decision.
- Physics correctness, units, notation, and simulation validation checks in `Standard-Compliance-Checklist.md`.

## Changed

- Updated README documentation to include physics domain standards.
- Updated README template to reference physics standards, units, notation, and simulation validation.
- Updated AI agent guidance to require physics domain standards when editing physics content.
- Updated version baseline from `1.2.0` to `1.3.0`.

## Governance

- Physics correctness, unit consistency, and simulation validation are now part of profile-based compliance review.

---

# 1.2.0 - 2026-08-01

Added architecture enforcement rules.

## Added

- `Architecture-Enforcement.md` for enforceable dependency and responsibility boundaries.
- ADR 0003 for the architecture enforcement decision.
- Architecture enforcement checks in `Standard-Compliance-Checklist.md`.
- Simple repository exception rules for small browser-based learning applications.
- Forbidden dependency guidance for the Physics Domain.

## Changed

- Updated README documentation to include architecture enforcement.
- Updated README template to reference architecture enforcement in repository architecture rules.
- Updated AI agent guidance to require architecture enforcement checks during implementation and review.
- Updated version baseline from `1.1.0` to `1.2.0`.

## Governance

- Architecture enforcement is now part of compliance review, but automated enforcement is reserved for future tooling work.

---

# 1.1.0 - 2026-08-01

Added profile-based compliance governance.

## Added

- `Repository-Profiles.md` for selecting the appropriate repository profile.
- `Standard-Compliance-Checklist.md` for profile-based compliance checks.
- ADR 0002 for the repository profile and compliance checklist decision.
- Compliance result labels: `Compliant`, `Conditionally compliant`, `Not compliant`, and `Not assessed`.
- Checklist status values: `Pass`, `Partial`, `Fail`, and `Not applicable`.

## Changed

- Updated README documentation to include repository profiles and compliance checklist documents.
- Updated AI agent rules to require profile and compliance guidance when creating or reviewing repositories.
- Updated README template to include standard version and compliance status fields.

## Governance

- Version updated from `1.0.0` to `1.1.0` because this release adds compatible new standards without breaking existing repositories.

---

# 1.0.0 - 2026-08-01

Initial approved baseline of the Physics Learning Standard.

## Added

- Core engineering principles.
- Domain-Centric Architecture.
- Standard repository and source folder structure.
- JavaScript coding standards.
- Naming conventions.
- Canvas implementation guidelines.
- UI and UX guidelines.
- Formula display guidelines.
- Accessibility guidelines.
- AI agent collaboration rules.
- Official README template for ecosystem repositories.
- Contribution workflow.
- Decision record process.
- License scope for original standard materials.
- Versioning and changelog governance documents.
- ADR directory for significant decisions.

## Governance

- Established Semantic Versioning for standard changes.
- Established changelog tracking for approved standard updates.
- Established `adr/` as the location for individual decision records.

---

# Change Categories

Use these categories when updating this changelog:

- `Added` for new standards, templates, sections, or guidance.
- `Changed` for updates to existing standards.
- `Deprecated` for standards that should no longer be used.
- `Removed` for standards or rules that were deleted.
- `Fixed` for corrections that do not change intent.
- `Security` for security-related changes.
- `Governance` for versioning, decision, approval, or release-process updates.

---

# Changelog Rules

Every approved standard update should include:

- The version affected.
- The date of the change.
- A short description of what changed.
- A short explanation of why the change matters.
- Links or references to related ADRs when applicable.
