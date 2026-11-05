# Decision 0005: Define Validation Workflow

Status: Accepted

Date: 2026-08-01

---

# Context

The Physics Learning Standard now contains governance, architecture enforcement, compliance profiles, physics domain standards, unit rules, and simulation rules.

As the standard grows, maintainers need a repeatable way to check whether the standard repository remains internally consistent.

The ecosystem also needs a shared expectation that validation should be reported before work is considered complete.

Without a validation workflow, documentation changes can drift apart, version updates can be missed, ADR files can be forgotten, and AI agents may finish work without explaining what was checked.

---

# Decision

The Physics Learning Standard defines `Validation-Workflow.md` as the shared validation process.

The standard repository also includes `scripts/validate-standard.ps1` as a lightweight local validation script for this repository.

The validation workflow separates three levels:

- Standard repository validation.
- Ecosystem repository compliance review.
- Implementation validation for code, UI, simulations, and generated content.

Automated checks support review, but do not replace human judgment.

---

# Rationale

Validation should be simple enough for non-developer maintainers to understand.

The standard repository needs automatic checks for common documentation mistakes such as missing files, mismatched versions, unindexed ADR files, unbalanced Markdown code fences, and obsolete references.

Repository-specific correctness still depends on human and project-specific review, especially for physics correctness, accessibility, simulation behavior, and third-party content licensing.

This decision makes validation visible without pretending that a script can verify all educational or scientific quality.

---

# Impact

Changes to this standard repository should run or document standard validation before completion.

AI agents should report validation performed.

Future ecosystem repositories can reference the validation workflow in their README files.

The validation script becomes a maintained utility of the standard repository.

Adding validation automation is compatible with existing repositories because it adds guidance and tooling without changing repository profiles or breaking existing structure.

---

# Related Standards

- `Validation-Workflow.md`
- `scripts/validate-standard.ps1`
- `VERSION.md`
- `CHANGELOG.md`
- `Decision-Records.md`
- `Repository-Profiles.md`
- `Standard-Compliance-Checklist.md`
- `README-Template.md`
- `AI-Agent-Rules.md`
- `AGENTS.md`

