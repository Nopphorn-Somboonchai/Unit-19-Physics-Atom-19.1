# CONTRIBUTING.md

# Contributing to physics-learning-standard

Thank you for contributing to this project.

This repository follows a Documentation-Driven Development (DDD) workflow, where documentation defines the architecture, standards, and implementation expectations.

---

# Before Contributing

Before making any changes, please read:

1. README.md
2. AGENTS.md
3. VERSION.md
4. CHANGELOG.md
5. Architecture.md
6. Architecture-Enforcement.md
7. Repository-Profiles.md
8. Standard-Compliance-Checklist.md
9. AI-Agent-Rules.md
10. Validation-Workflow.md
11. Decision-Records.md

Then read any additional documentation related to the area you are modifying.

---

# Contribution Workflow

Follow this workflow for every contribution.

## 1. Understand the Task

Clearly identify:

- the objective
- affected files
- expected outcome

Avoid making assumptions.

---

## 2. Review Documentation

Read the relevant documentation before writing code.

Documentation is the source of truth.

---

## 3. Implement Incrementally

Prefer:

- small changes
- focused commits
- isolated improvements

Avoid mixing unrelated changes.

---

## 4. Validate

Before submitting your work, verify:

- implementation matches documentation
- no unrelated files were modified
- existing functionality is preserved
- architecture boundaries follow Architecture-Enforcement.md when code exists
- version and changelog updates are included when standards change
- significant decisions are recorded in `adr/` when required
- repository profile and compliance requirements are updated when repository expectations change
- validation follows `Validation-Workflow.md`

For changes to this standard repository, run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-standard.ps1
```

---

## 5. Submit

When opening a Pull Request, include:

- purpose
- summary of changes
- affected files
- validation performed
- version impact
- related ADRs (if any)
- known limitations (if any)

---

# Pull Request Guidelines

A good Pull Request should:

- solve one problem
- be easy to review
- reference relevant documentation
- update CHANGELOG.md when standards change
- update VERSION.md when the approved standard version changes
- avoid unnecessary refactoring

Large changes should be divided into smaller Pull Requests whenever possible.

---

# Commit Guidelines

Write clear, descriptive commit messages.

Examples:

- docs: update accessibility guideline
- feat: implement formula renderer
- fix: correct unit conversion
- refactor: simplify lesson parser

Avoid vague messages such as:

- update
- fix
- changes
- misc

---

# Documentation Changes

If implementation requires documentation updates:

1. Update the relevant documentation.
2. Keep documentation and implementation consistent.
3. Explain the reason for the change.
4. Update CHANGELOG.md when the change affects standards or repository expectations.
5. Update VERSION.md when the change changes the approved standard version.

Never leave documentation outdated.

---

# Version and Decision Records

Use `VERSION.md` to identify the current approved standard version.

Use `CHANGELOG.md` to record approved changes.

Use `adr/` for significant architectural or cross-repository decisions.

Routine wording fixes do not require a new ADR, but they should still be reflected in `CHANGELOG.md` when they affect repository expectations.

Use `Repository-Profiles.md` and `Standard-Compliance-Checklist.md` when a change affects how repositories are classified or reviewed.

Use `Validation-Workflow.md` to decide what validation should be run or documented before completion.

---

# When You Are Unsure

Do not guess.

Instead:

- explain the uncertainty
- identify affected documentation
- ask for clarification

---

# Code Review Checklist

Before requesting review, confirm:

- Documentation reviewed
- Relevant standards followed
- Changes limited to task scope
- No unrelated modifications
- Validation completed
- Validation results reported

---

# Community Principles

Contributors are encouraged to:

- preserve consistency
- respect documented decisions
- communicate clearly
- prefer discussion over assumptions

Our goal is to build a maintainable, well-documented, and trustworthy standard for physics learning software.

---

Thank you for contributing.
