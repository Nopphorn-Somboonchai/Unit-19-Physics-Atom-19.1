# Standard Automation Scripts

> Script usage notes for the Physics Learning Standard repository.

---

# Purpose

The scripts in this folder provide lightweight automation for maintainers and
AI agents.

Automation supports review. It does not replace human judgment for physics
correctness, learning quality, accessibility, licensing, or repository-specific
behavior.

---

# Standard Repository Validation

Use this command after changing `physics-learning-standard`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-standard.ps1
```

This script checks that the standard repository remains internally consistent.

It verifies required files, version references, README template consistency, ADR
index entries, key cross-references, JSON validity for schemas, and selected
architecture-boundary examples.

---

# Child Repository Validation

Use this command from the standard repository to run a lightweight compliance
check against a child repository:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-repository.ps1 -Target examples/physics-unit-example
```

For an external child repository, pass its path:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-repository.ps1 -Target H:\path\to\child-repository
```

`validate-repository.ps1` is read-only.

It checks:

- `README.md` existence.
- Declared repository profile.
- `physics-learning-standard` reference.
- Standard version field.
- Compliance status field.
- Maintainer, license, structure, and validation documentation.
- Profile-specific README evidence.
- Basic `src/physics/` and `src/application/` boundary rules.

The child repository validator is intentionally lightweight. Passing it means
the repository has basic compliance evidence; it does not prove scientific
correctness, UI quality, accessibility behavior, or production readiness.

---

# Reporting

When reporting validation, include:

- The command that was run.
- Whether it passed or failed.
- Any blocking failures.
- Any known checks that still require human review.
