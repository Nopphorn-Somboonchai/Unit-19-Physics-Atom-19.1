# Architectural Decision Records

> Index of decision records for the Physics Learning Standard.

Decision records explain why significant architectural or engineering decisions were made.

---

# Index

| ADR | Status | Date | Title |
| :--- | :--- | :--- | :--- |
| [0001](0001-adopt-domain-centric-architecture.md) | Accepted | 2026-08-01 | Adopt Domain-Centric Architecture |
| [0002](0002-define-repository-profiles-and-compliance.md) | Accepted | 2026-08-01 | Define Repository Profiles and Compliance Checklist |
| [0003](0003-define-architecture-enforcement-rules.md) | Accepted | 2026-08-01 | Define Architecture Enforcement Rules |
| [0004](0004-define-physics-domain-standards.md) | Accepted | 2026-08-01 | Define Physics Domain Standards |
| [0005](0005-define-validation-workflow.md) | Accepted | 2026-08-01 | Define Validation Workflow |
| [0006](0006-define-dynamic-quiz-system-rules.md) | Accepted | 2026-08-01 | Define Dynamic Quiz System Rules |
| [0007](0007-define-timed-exam-system-rules.md) | Accepted | 2026-08-02 | Define Timed Exam System Rules |
| [0008](0008-standardize-high-school-gravity-approximation.md) | Accepted | 2026-08-02 | Standardize High-School Gravity Approximation |
| [0009](0009-add-reference-implementation-example.md) | Accepted | 2026-08-02 | Add Reference Implementation Example |
| [0010](0010-define-dynamic-quiz-fallback-strategy.md) | Accepted | 2026-08-02 | Define Dynamic Quiz Fallback Strategy |
| [0011](0011-define-timed-exam-interruption-recovery.md) | Accepted | 2026-08-02 | Define Timed Exam Interruption Recovery |
| [0012](0012-add-implementation-support-examples.md) | Accepted | 2026-08-02 | Add Implementation Support Examples |
| [0013](0013-add-child-repository-validation-and-agent-decision-matrix.md) | Accepted | 2026-08-02 | Add Child Repository Validation and Agent Decision Matrix |
| [0014](0014-add-expanded-governance-guidance.md) | Accepted | 2026-08-02 | Add Expanded Governance Guidance |

---

# Naming Convention

ADR files should use this format:

```text
NNNN-short-decision-title.md
```

Examples:

```text
0001-adopt-domain-centric-architecture.md
0002-define-repository-profiles-and-compliance.md
0003-define-architecture-enforcement-rules.md
0004-define-physics-domain-standards.md
0005-define-validation-workflow.md
0006-define-dynamic-quiz-system-rules.md
0007-define-timed-exam-system-rules.md
0008-standardize-high-school-gravity-approximation.md
0009-add-reference-implementation-example.md
0010-define-dynamic-quiz-fallback-strategy.md
0011-define-timed-exam-interruption-recovery.md
0012-add-implementation-support-examples.md
0013-add-child-repository-validation-and-agent-decision-matrix.md
0014-add-expanded-governance-guidance.md
```

---

# Status Values

Decision records should use one of these statuses:

- Proposed
- Accepted
- Implemented
- Superseded
- Archived

---

# Rules

- Significant decisions should have one ADR file.
- ADR numbers should not be reused.
- Historical ADRs should remain in the repository even when superseded.
- Superseded ADRs should link to the newer decision.
- ADRs should explain why a decision was made, not only what changed.
