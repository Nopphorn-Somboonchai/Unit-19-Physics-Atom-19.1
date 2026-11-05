# Decision 0013: Add Child Repository Validation and Agent Decision Matrix

Status: Accepted

Date: 2026-08-02

---

# Context

The standard already defines repository profiles, compliance checklists,
reference implementation examples, profile README examples, and reusable test
templates.

Child repositories still need a lightweight way to catch missing baseline
evidence before a full review. The most common early issues are missing README
profile fields, missing standard version references, incomplete validation
notes, and simple source boundary violations such as browser APIs in
`src/physics/`.

AI agents also spend unnecessary tokens when they load every domain-specific
standard for tasks that only touch one area. The existing required reading rules
are correct, but they need a quick task-to-document matrix to make conditional
reading easier to apply consistently.

---

# Decision

The standard adds:

- `scripts/validate-repository.ps1`, a read-only child repository preflight
  validator.
- `scripts/README.md`, documenting the purpose, usage, and limits of the
  validation scripts.
- A Document Selection Matrix in `AGENTS.md` to guide task-specific reading.

The child repository validator checks basic compliance evidence:

- `README.md` existence.
- Declared supported repository profile.
- `physics-learning-standard` reference.
- Standard version field.
- Compliance status field.
- Maintainer, structure, validation, and license documentation.
- Profile-specific README hints.
- Basic source boundary rules for `src/physics/`, `src/application/`, and
  strict `physics-engine` repositories.

The validator does not replace the profile checklist, human review, physics
review, accessibility review, licensing review, or repository-specific tests.

---

# Rationale

Automation is useful when it catches structural omissions early and produces
plain failures that maintainers can fix quickly.

Keeping the child validator read-only makes it safe to run from the standard
repository against example folders or external child repositories. Treating
older standard versions as informational instead of failing avoids forcing every
child repository to migrate immediately.

The Document Selection Matrix reduces repeated standards loading while
preserving the core rule that task-specific standards must be read when the task
touches that behavior.

---

# Impact

Maintainers and AI agents can run a preflight check before completing a child
repository review:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-repository.ps1 -Target path/to/child-repository
```

Repositories that pass the script still need profile-based review through
`Standard-Compliance-Checklist.md` and their own implementation validation.

AI agents should use the matrix in `AGENTS.md` to avoid loading unrelated
domain-specific standards while still reading the documents required for the
task.

---

# Related Standards

- `AGENTS.md`
- `AI-Agent-Rules.md`
- `Repository-Profiles.md`
- `Standard-Compliance-Checklist.md`
- `README-Template.md`
- `Architecture-Enforcement.md`
- `Validation-Workflow.md`
