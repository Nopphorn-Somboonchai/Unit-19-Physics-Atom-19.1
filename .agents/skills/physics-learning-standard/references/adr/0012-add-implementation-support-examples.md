# Decision 0012: Add Implementation Support Examples

Status: Accepted

Date: 2026-08-02

---

# Context

The standard now includes a reference `learning-unit` implementation, dynamic
quiz fallback guidance, and timed exam recovery guidance.

Child repositories still need practical support for two repeated setup tasks:

- Writing first-pass tests for Physics Domain formulas, dynamic question
  generation, and numerical answer validation.
- Filling `README-Template.md` correctly for repository profiles that are not
  full learning units.

Without examples, maintainers and AI agents may copy the template too literally,
invent non-applicable fields, or write tests through UI text instead of testing
domain-safe logic.

---

# Decision

The standard adds implementation support examples:

- `examples/test-templates/` provides runnable Node.js contract-test examples
  for Physics Domain formulas, dynamic question behavior, and answer validation.
- `examples/readme-profile-examples/` provides filled README examples for
  `interactive-simulation`, `shared-library`, `physics-engine`,
  `documentation-only`, and `utility-package` profiles.

These examples are support artifacts. They are not production answer logic,
production child repositories, or additional required architecture layers.

Child repositories may copy and adapt the patterns while replacing fictional
example data with their actual modules, physics scope, validation cases, and
commands.

---

# Rationale

Contract-test examples make the desired testing boundary concrete. They show how
to test formulas, generated parameters, attempt consistency, and tolerance
behavior without depending on DOM, Canvas, storage, or rendered text.

Profile README examples reduce friction when a repository is not a learning
unit. They make `Not applicable` usage explicit and discourage invented course,
assessment, or learner fields.

Keeping these artifacts under `examples/` preserves the difference between
standards and implementation support while still making the patterns easy to
find.

---

# Impact

Child repositories can start from the example contracts and README examples
instead of rebuilding these patterns from scratch.

Maintainers should still review child repositories against
`Standard-Compliance-Checklist.md`; examples do not replace compliance review.

The standard validation script now checks that the support artifacts exist,
remain referenced, and keep their example tests runnable.

---

# Related Standards

- `README-Template.md`
- `Repository-Profiles.md`
- `Standard-Compliance-Checklist.md`
- `Architecture-Enforcement.md`
- `Physics-Standards.md`
- `Simulation-Standards.md`
- `Dynamic-Quiz-System-Rules.md`
- `Validation-Workflow.md`
