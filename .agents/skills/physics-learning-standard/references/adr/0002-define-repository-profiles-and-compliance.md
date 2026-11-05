# Decision 0002: Define Repository Profiles and Compliance Checklist

Status: Accepted

Date: 2026-08-01

---

# Context

The Physics Learning Ecosystem includes different kinds of repositories.

Some repositories are complete learning units. Some are focused simulations. Some are shared libraries, physics engines, documentation repositories, or utility packages.

Applying exactly the same requirements to every repository would create confusion.

For example, a documentation-only repository should not be forced to include simulation controls, and a shared library should not be forced to declare a course unit or grade level.

The ecosystem needs a way to verify consistency without forcing unrelated requirements onto repositories where they do not apply.

---

# Decision

The Physics Learning Standard defines standard repository profiles.

Each repository should declare one primary profile:

- `learning-unit`
- `interactive-simulation`
- `shared-library`
- `physics-engine`
- `documentation-only`
- `utility-package`

The standard also defines a profile-based compliance checklist.

Compliance should be evaluated against the repository's selected profile.

Checklist items may be marked as:

- `Pass`
- `Partial`
- `Fail`
- `Not applicable`

---

# Rationale

Repository profiles make expectations clearer for maintainers, contributors, and AI agents.

They allow the ecosystem to remain consistent while respecting the purpose of each repository.

The `Not applicable` status prevents contributors from inventing course, unit, source-code, simulation, test, or build information that does not belong in a repository.

The compliance checklist turns broad standards into reviewable evidence.

---

# Impact

Repositories should declare their primary profile in `README.md`.

Maintainers and AI agents should use `Repository-Profiles.md` and `Standard-Compliance-Checklist.md` when creating, reviewing, or updating repositories.

Compliance reviews should explain any `Partial`, `Fail`, or `Not applicable` items.

This decision does not change the Domain-Centric Architecture.

It defines how repositories are classified and checked against existing standards.

---

# Related Standards

- `Repository-Profiles.md`
- `Standard-Compliance-Checklist.md`
- `README-Template.md`
- `Folder-Structure.md`
- `Architecture.md`
- `AI-Agent-Rules.md`
