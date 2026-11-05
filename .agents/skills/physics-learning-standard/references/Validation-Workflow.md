# Validation Workflow

> Validation workflow for the Physics Learning Standard and ecosystem repositories.

This document defines how maintainers, contributors, and AI agents should validate standard changes and repository compliance.

---

# Purpose

Validation keeps the Physics Learning Ecosystem consistent.

The goal is not to create bureaucracy.

The goal is to make sure documentation, standards, architecture rules, physics rules, and repository expectations stay aligned before a change is considered complete.

---

# Core Rule

Every meaningful change should report the validation that was performed.

If validation cannot be performed, the reason should be documented.

Validation results should be understandable by maintainers who are not developers.

---

# Validation Levels

The ecosystem uses three validation levels.

## Level 1: Standard Repository Validation

Use this level when modifying `physics-learning-standard`.

This validation checks that the standard repository remains internally consistent.

It includes:

- Required standard files exist.
- Required files are not empty.
- Current version is documented.
- `README-Template.md` matches the current standard version.
- `CHANGELOG.md` contains the current version.
- ADR files are indexed.
- Markdown code fences are balanced.
- Obsolete document paths are not used.
- `LICENSE` exists without requiring `LICENSE.md`.

The standard repository includes an automation script for this level:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-standard.ps1
```

---

## Level 2: Ecosystem Repository Compliance Review

Use this level when creating or reviewing a repository that follows this standard.

This validation checks whether the repository follows the appropriate profile.

It includes:

- Select a repository profile from `Repository-Profiles.md`.
- Fill or review the repository `README.md` using `README-Template.md`.
- Use `Standard-Compliance-Checklist.md`.
- Document `Pass`, `Partial`, `Fail`, or `Not applicable` for applicable checks.
- Record the compliance result in the repository README.
- Document justified exceptions.
- Review `Internationalization-and-Localization.md`,
  `Security-and-Privacy.md`, and `Performance-Standards.md` items when
  applicable.

This level is mostly human-readable and does not require automation.

Automation may support the review, but it should not replace human judgment.

The standard repository provides a lightweight child repository validator for
basic preflight checks:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-repository.ps1 -Target path/to/child-repository
```

This validator is read-only. It checks README profile evidence, standard
version fields, compliance status fields, profile-specific documentation hints,
and basic source boundary rules for `src/physics/` and `src/application/`.

Passing this script means the repository has basic compliance evidence. It does
not replace the profile checklist, physics review, accessibility review, or
repository-specific tests.

---

## Level 3: Implementation Validation

Use this level when a repository contains source code, simulations, dynamic questions, UI, or generated content.

This validation depends on the repository profile and technology.

Examples:

- Run unit tests.
- Run build checks.
- Review architecture boundaries.
- Check physics formulas and units.
- Check simulation validation cases.
- Check dynamic quiz parameter generation, attempt consistency, and answer validation.
- Check timed exam start screens, identity validation, timing, lock behavior, scoring, and submitted result data.
- Check learner data handling, input validation, privacy, export, submission, and secrets when applicable.
- Check primary UI language, bilingual labels, locale formatting, and encoding when applicable.
- Check simulation, rendering, dynamic generation, asset loading, and submission performance when applicable.
- Check accessibility.
- Check responsive behavior.
- Check that documentation matches the actual implementation.

Each repository should document its own commands in `README.md`.

---

# Standard Repository Validation Script

The standard repository provides:

```text
scripts/validate-standard.ps1
scripts/validate-repository.ps1
```

These scripts are intentionally lightweight.

`validate-standard.ps1` validates the structure and consistency of this standard
repository.

`validate-repository.ps1` validates one selected child repository when a target
path is provided.

The scripts do not validate every child repository automatically.

## What the Script Checks

- Core standard documents exist.
- Required directories exist.
- Required files are not empty.
- `VERSION.md` contains the current version.
- `README-Template.md` uses the same template version.
- `CHANGELOG.md` records the current version.
- `README.md` references required standard documents.
- `AGENTS.md`, `AI-Agent-Rules.md`, and `CONTRIBUTING.md` reference the validation workflow.
- ADR files are listed in `adr/README.md`.
- Markdown code fences are balanced.
- Obsolete references such as old `docs/...` paths are not present.
- Child repository validation automation is documented and referenced.

## What the Child Repository Script Checks

- `README.md` exists and is not empty.
- README declares one supported repository profile.
- README references `physics-learning-standard`.
- README declares a standard version or marks it `Not applicable`.
- README declares a compliance status.
- README identifies maintainer, structure, validation, and license information.
- Profile-specific README evidence is present.
- `src/physics/` avoids DOM, Canvas, storage, and network APIs.
- `src/application/` avoids DOM, Canvas, and concrete browser storage APIs.
- `physics-engine` repositories avoid browser, storage, rendering, and network
  APIs under `src/`.

## What the Script Does Not Check

The script does not replace review for:

- Physics correctness.
- Learning quality.
- Visual design.
- Accessibility behavior in a browser.
- Simulation accuracy beyond documented static checks.
- Third-party content licensing.
- Security, privacy, PDPA, or institutional policy decisions.
- Performance on every possible device or network.
- Translation quality for learner-facing physics content.
- Repository-specific build or test commands.
- Final profile compliance decisions for child repositories.

Those checks still require human review and repository-specific validation.

---

# When to Run Validation

Run validation:

- Before completing a change to this standard repository.
- Before updating `VERSION.md`.
- After changing `README-Template.md`.
- After adding or changing ADR files.
- After adding a new standard document.
- Before using the standard as a baseline for another repository.

---

# Human Review Checklist

After running automated validation, perform a short human review.

Check:

| Area | Question |
| :--- | :--- |
| Purpose | Does the change solve the intended problem? |
| Consistency | Do related documents say the same thing? |
| Versioning | Does the version match the size of the change? |
| Changelog | Does the changelog explain what changed? |
| ADR | Is there an ADR for significant cross-repository decisions? |
| Profile impact | Does the change affect repository profiles or compliance checks? |
| Physics impact | Does the change affect formulas, units, simulations, or scientific correctness? |
| AI impact | Are AI agent instructions updated when expectations change? |
| Usability | Can a non-developer maintainer understand what to do next? |

---

# Validation Report Format

When reporting validation, use a short summary.

Example:

```text
Validation performed:
- Ran scripts/validate-standard.ps1.
- Checked README-Template.md version.
- Checked ADR index.
- Reviewed related standards for conflicts.

Result:
- Pass. No blocking issues found.
```

If validation fails, report:

- What failed.
- Which file is affected.
- Whether it blocks release.
- What should be fixed next.

---

# Rules for AI Agents

AI agents should:

- Run the standard validation script after changing this repository when possible.
- Report validation performed before completion.
- Explain failures in plain language.
- Avoid marking work complete when required validation fails.
- Use human-readable review together with automated checks.

AI agents should not:

- Treat automation as a replacement for physics review.
- Treat automation as a replacement for accessibility review.
- Invent validation results that were not performed.
- Hide validation failures.

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `VERSION.md`, `CHANGELOG.md`, `Decision-Records.md`, `Repository-Profiles.md`, `Standard-Compliance-Checklist.md`, and `README-Template.md`.
