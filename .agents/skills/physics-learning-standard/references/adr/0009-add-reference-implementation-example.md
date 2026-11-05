# Decision 0009: Add Reference Implementation Example

Status: Accepted

Date: 2026-08-02

---

# Context

The Physics Learning Standard defines architecture, profile, physics, dynamic
quiz, timed exam, and validation expectations. Maintainers also need a small
working example that shows how those expectations fit together in code.

Without a reference implementation, child repositories may interpret the
standards inconsistently, especially around the boundary between Physics Domain
logic, application services, UI adapters, storage adapters, dynamic question
generation, and timed exam submission.

---

# Decision

The standard repository includes `examples/physics-unit-example/` as a reference
implementation for a `learning-unit` repository.

The example demonstrates:

- `src/physics/` for constants, formulas, generated parameters, answer
  validation, and worked solution generation.
- `src/application/` for exam configuration, attempt lifecycle, and scoring
  coordination.
- `src/adapters/ui/` for DOM rendering and browser events.
- `src/adapters/storage/` for browser local storage.
- A roll-number based dynamic question using `R in [1, 40]`.
- A timed exam start screen and deterministic submission behavior.
- Tests for Physics Domain and application behavior.

---

# Rationale

A compact example makes the standard easier to apply and review.

The example is intentionally small so maintainers can inspect the architecture
without needing a framework, build system, backend, or third-party dependency.

Keeping the example inside `physics-learning-standard` ensures it evolves with
the standards and can be validated by the standard repository script.

---

# Impact

Child repositories may use the example as a reference for structure and
responsibility boundaries, but should still adapt lesson content, visual design,
deployment, and storage to their own needs.

The example is not a production lesson template. It is a minimal demonstration
of compliance patterns.

The standard validation script now checks that the reference implementation
exists, is indexed, and keeps browser APIs out of `src/physics/`.

---

# Related Standards

- `Architecture.md`
- `Architecture-Enforcement.md`
- `Folder-Structure.md`
- `Repository-Profiles.md`
- `Standard-Compliance-Checklist.md`
- `Physics-Standards.md`
- `Units-and-Notation.md`
- `Dynamic-Quiz-System-Rules.md`
- `Timed-Exam-System-Rules.md`
- `Validation-Workflow.md`
