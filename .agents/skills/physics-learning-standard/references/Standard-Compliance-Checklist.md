# Standard Compliance Checklist

> Profile-based compliance checklist for repositories in the Physics Learning Ecosystem.

This document helps maintainers, contributors, and AI agents verify whether a repository follows the Physics Learning Standard.

---

# Purpose

The goal of compliance is consistency, not bureaucracy.

A repository is compliant when it clearly follows the standards that apply to its selected repository profile and documents any justified exceptions.

---

# How to Use This Checklist

1. Select the repository profile from `Repository-Profiles.md`.
2. Review the universal checklist.
3. Review the checklist for the selected profile.
4. Mark each item as `Pass`, `Partial`, `Fail`, or `Not applicable`.
5. Add short notes for `Partial`, `Fail`, or `Not applicable`.
6. Fix issues or document justified exceptions.

---

# Status Values

| Status | Meaning |
| :--- | :--- |
| `Pass` | The repository satisfies the requirement. |
| `Partial` | The repository partly satisfies the requirement, but work remains. |
| `Fail` | The repository does not satisfy the requirement. |
| `Not applicable` | The requirement does not apply to the selected profile. |

---

# Compliance Result

Use one of these result labels:

| Result | Meaning |
| :--- | :--- |
| `Compliant` | All required applicable items pass. |
| `Conditionally compliant` | Required items mostly pass, but documented improvements remain. |
| `Not compliant` | One or more required applicable items fail without justification. |
| `Not assessed` | The repository has not been checked yet. |

---

# Universal Checklist

These checks apply to every repository unless clearly marked `Not applicable`.

| Check | Requirement | Status | Notes |
| :--- | :--- | :--- | :--- |
| Repository profile | README declares one primary repository profile. | [Pass / Partial / Fail / Not applicable] | |
| Standard reference | README references `physics-learning-standard`. | [Pass / Partial / Fail / Not applicable] | |
| Standard version | README identifies the followed standard version when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Purpose | README clearly explains why the repository exists. | [Pass / Partial / Fail / Not applicable] | |
| License | Repository includes a license or documents a pending license decision. | [Pass / Partial / Fail / Not applicable] | |
| Maintainer | Repository identifies a maintainer or owner. | [Pass / Partial / Fail / Not applicable] | |
| Structure | File and folder structure matches the README. | [Pass / Partial / Fail / Not applicable] | |
| Documentation accuracy | Documentation matches the actual repository. | [Pass / Partial / Fail / Not applicable] | |
| Architecture | Responsibilities are separated according to `Architecture.md`. | [Pass / Partial / Fail / Not applicable] | |
| Architecture enforcement | Dependency boundaries follow `Architecture-Enforcement.md` when code exists. | [Pass / Partial / Fail / Not applicable] | |
| Infrastructure boundary | Infrastructure modules, when present, do not contain physics or educational logic. | [Pass / Partial / Fail / Not applicable] | |
| Naming | Files, folders, and code names follow `Naming-Conventions.md`. | [Pass / Partial / Fail / Not applicable] | |
| Coding standards | Production code follows `Coding-Standards.md` when code exists. | [Pass / Partial / Fail / Not applicable] | |
| Accessibility | Accessibility considerations are documented when learners interact with the repository. | [Pass / Partial / Fail / Not applicable] | |
| Internationalization | Primary language, bilingual labels, locale formatting, and encoding follow `Internationalization-and-Localization.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Security and privacy | Learner data, input handling, storage, export, submission, and secrets follow `Security-and-Privacy.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Performance | Simulations, Canvas rendering, dynamic generation, assets, and assessment submission follow `Performance-Standards.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| AI guidance | AI agent instructions are present or referenced. | [Pass / Partial / Fail / Not applicable] | |
| Third-party content | Third-party materials are identified and not incorrectly relicensed. | [Pass / Partial / Fail / Not applicable] | |
| Validation | README or docs explain how the repository was validated. | [Pass / Partial / Fail / Not applicable] | |
| Validation workflow | Validation follows `Validation-Workflow.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Automation preflight | `scripts/validate-repository.ps1` runs from the standard repository when practical, or the reason it was not run is documented. | [Pass / Partial / Fail / Not applicable] | |
| Physics standards | Physics content follows `Physics-Standards.md` when physics content exists. | [Pass / Partial / Fail / Not applicable] | |
| Units and notation | Units, symbols, and formulas follow `Units-and-Notation.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Dynamic quiz rules | Dynamic quizzes follow `Dynamic-Quiz-System-Rules.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Timed exam rules | Timed or scored exams follow `Timed-Exam-System-Rules.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |

---

# learning-unit Checklist

Use this checklist when the primary profile is `learning-unit`.

| Check | Requirement | Status | Notes |
| :--- | :--- | :--- | :--- |
| Learning context | README identifies learners, course, unit, topic, or marks them `Not applicable`. | [Pass / Partial / Fail / Not applicable] | |
| Learning objectives | README lists observable learning objectives. | [Pass / Partial / Fail / Not applicable] | |
| Physics scope | README documents concepts, formulas, variables, units, assumptions, and limitations. | [Pass / Partial / Fail / Not applicable] | |
| Learning features | README describes explanations, simulations, practice, assessment, or feedback as applicable. | [Pass / Partial / Fail / Not applicable] | |
| Formula display | Formulas are readable and consistent with `Formula-Display.md`. | [Pass / Partial / Fail / Not applicable] | |
| Units and notation | Symbols and units follow `Units-and-Notation.md`. | [Pass / Partial / Fail / Not applicable] | |
| Assumptions | Simplified physics models document assumptions and limitations. | [Pass / Partial / Fail / Not applicable] | |
| Architecture boundaries | Physics logic is separated from UI, Canvas, storage, and formula rendering where practical. | [Pass / Partial / Fail / Not applicable] | |
| Practice correctness | Practice or quiz answers are calculated from formulas when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Dynamic quiz system | Roll-number based or randomized quizzes follow `Dynamic-Quiz-System-Rules.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Dynamic quiz fallback | Dynamic quiz generators document `maxRetries`, retry exhaustion behavior, learner message, and review logging when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Timed exam system | Timed or scored exams document start screen, learner identity, timing, scoring, locking, and result data rules. | [Pass / Partial / Fail / Not applicable] | |
| Timed exam recovery | Timed or scored exams document local persistence, recovery flow, sync/export behavior, and submission state after offline or interrupted attempts. | [Pass / Partial / Fail / Not applicable] | |
| Timed exam security | Timed or scored exams document data minimization, input validation, tamper limits, privacy notes, and sync/export review behavior. | [Pass / Partial / Fail / Not applicable] | |
| Numerical tolerance | Numerical answer checking documents tolerance when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Feedback quality | Feedback supports learning rather than only reporting correct or incorrect. | [Pass / Partial / Fail / Not applicable] | |
| References | Textbooks, curricula, or learning sources are cited clearly. | [Pass / Partial / Fail / Not applicable] | |

---

# interactive-simulation Checklist

Use this checklist when the primary profile is `interactive-simulation`.

| Check | Requirement | Status | Notes |
| :--- | :--- | :--- | :--- |
| Simulation purpose | README explains what the simulation demonstrates. | [Pass / Partial / Fail / Not applicable] | |
| Physics model | The model, assumptions, variables, and units are documented. | [Pass / Partial / Fail / Not applicable] | |
| Domain separation | Physics calculations are separate from rendering code. | [Pass / Partial / Fail / Not applicable] | |
| Dependency direction | Dependencies follow the direction defined in `Architecture-Enforcement.md`. | [Pass / Partial / Fail / Not applicable] | |
| Input constraints | User inputs stay within physically reasonable ranges. | [Pass / Partial / Fail / Not applicable] | |
| Tolerance | Numerical tolerance follows `Simulation-Standards.md` when calculated values are checked. | [Pass / Partial / Fail / Not applicable] | |
| Randomness | Randomized behavior is constrained and documented. | [Pass / Partial / Fail / Not applicable] | |
| Validation cases | Simulation includes known cases or expected behavior checks. | [Pass / Partial / Fail / Not applicable] | |
| Dynamic quiz behavior | Dynamic quiz behavior follows `Dynamic-Quiz-System-Rules.md` when the simulation includes randomized quiz questions. | [Pass / Partial / Fail / Not applicable] | |
| Dynamic quiz fallback | Dynamic quiz generators document `maxRetries`, retry exhaustion behavior, learner message, and review logging when randomized questions are included. | [Pass / Partial / Fail / Not applicable] | |
| Timed exam behavior | Timed or scored assessment behavior follows `Timed-Exam-System-Rules.md` when the simulation includes exam mode. | [Pass / Partial / Fail / Not applicable] | |
| Timed exam recovery | Exam mode documents recovery, timer continuity, local persistence, and sync/export status for interrupted attempts when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Rendering role | Canvas or visual code displays state and does not define physics truth. | [Pass / Partial / Fail / Not applicable] | |
| Performance | Rendering loops, generated values, assets, and responsiveness follow `Performance-Standards.md` when they affect usability. | [Pass / Partial / Fail / Not applicable] | |
| Motion accessibility | Animation supports learning and avoids unnecessary distraction. | [Pass / Partial / Fail / Not applicable] | |
| Responsive behavior | Simulation remains usable on supported screen sizes. | [Pass / Partial / Fail / Not applicable] | |
| Validation | Expected behavior is checked against known physics cases. | [Pass / Partial / Fail / Not applicable] | |

---

# shared-library Checklist

Use this checklist when the primary profile is `shared-library`.

| Check | Requirement | Status | Notes |
| :--- | :--- | :--- | :--- |
| Public API | README documents public modules, functions, or components. | [Pass / Partial / Fail / Not applicable] | |
| Usage examples | README or docs include usage examples. | [Pass / Partial / Fail / Not applicable] | |
| Reusability | Library avoids repository-specific assumptions. | [Pass / Partial / Fail / Not applicable] | |
| Boundary scope | Library documents whether it is domain-safe, adapter-specific, or utility-only. | [Pass / Partial / Fail / Not applicable] | |
| Tests | Reusable behavior is covered by tests when practical. | [Pass / Partial / Fail / Not applicable] | |
| Dependency clarity | Dependencies are documented and justified. | [Pass / Partial / Fail / Not applicable] | |
| Security and privacy | Examples, telemetry, or consuming applications do not expose learner data or secrets. | [Pass / Partial / Fail / Not applicable] | |
| Versioning | Public behavior changes are documented. | [Pass / Partial / Fail / Not applicable] | |

---

# physics-engine Checklist

Use this checklist when the primary profile is `physics-engine`.

| Check | Requirement | Status | Notes |
| :--- | :--- | :--- | :--- |
| Domain purity | Physics engine code does not depend on UI, Canvas, DOM, storage, or rendering libraries. | [Pass / Partial / Fail / Not applicable] | |
| Forbidden imports | Physics engine code avoids forbidden dependencies listed in `Architecture-Enforcement.md`. | [Pass / Partial / Fail / Not applicable] | |
| Formula correctness | Implemented formulas are documented and verified. | [Pass / Partial / Fail / Not applicable] | |
| Units | Units and constants are explicit. | [Pass / Partial / Fail / Not applicable] | |
| Notation | Symbols and quantity names follow `Units-and-Notation.md`. | [Pass / Partial / Fail / Not applicable] | |
| Constants source | Constants document source and approximation level when needed. | [Pass / Partial / Fail / Not applicable] | |
| Tolerances | Numerical tolerances are documented for approximate results. | [Pass / Partial / Fail / Not applicable] | |
| Determinism | Calculations are deterministic unless randomness is intentionally documented. | [Pass / Partial / Fail / Not applicable] | |
| Edge cases | Tests cover important edge cases and invalid inputs. | [Pass / Partial / Fail / Not applicable] | |
| API stability | Public calculation APIs are clear and documented. | [Pass / Partial / Fail / Not applicable] | |
| Performance | Large, iterative, or simulation-facing calculations document performance expectations when applicable. | [Pass / Partial / Fail / Not applicable] | |

---

# documentation-only Checklist

Use this checklist when the primary profile is `documentation-only`.

| Check | Requirement | Status | Notes |
| :--- | :--- | :--- | :--- |
| Document index | README lists the main documents and their purposes. | [Pass / Partial / Fail / Not applicable] | |
| Internal links | References between documents match actual paths. | [Pass / Partial / Fail / Not applicable] | |
| Empty files | Required referenced files are not empty unless intentionally reserved. | [Pass / Partial / Fail / Not applicable] | |
| Governance | Versioning, changelog, and decision-record process are documented when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Standard validation | Standard repository validation runs or is documented when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Architecture guidance | Architecture guidance references enforcement rules when implementation guidance is discussed. | [Pass / Partial / Fail / Not applicable] | |
| License scope | Original and third-party materials are clearly separated. | [Pass / Partial / Fail / Not applicable] | |
| Language and encoding | Bilingual documentation and Thai text follow `Internationalization-and-Localization.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Consistency | Standards do not contradict each other. | [Pass / Partial / Fail / Not applicable] | |

---

# utility-package Checklist

Use this checklist when the primary profile is `utility-package`.

| Check | Requirement | Status | Notes |
| :--- | :--- | :--- | :--- |
| Tool purpose | README explains what the tool does. | [Pass / Partial / Fail / Not applicable] | |
| Commands | README documents commands or usage steps. | [Pass / Partial / Fail / Not applicable] | |
| Inputs and outputs | Tool inputs, outputs, and generated files are documented. | [Pass / Partial / Fail / Not applicable] | |
| Safety | Destructive or file-changing behavior is documented and guarded. | [Pass / Partial / Fail / Not applicable] | |
| Security and privacy | Secrets, learner data, and privacy-sensitive inputs are handled according to `Security-and-Privacy.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Performance | Long-running validation, large repositories, or expensive checks document expected runtime when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Validation behavior | Tool validation behavior follows or references `Validation-Workflow.md` when applicable. | [Pass / Partial / Fail / Not applicable] | |
| Error messages | Expected errors are understandable and actionable. | [Pass / Partial / Fail / Not applicable] | |
| Tests | Important tool behavior is tested when practical. | [Pass / Partial / Fail / Not applicable] | |

---

# Evidence Template

Use this template when reporting compliance.

```md
# Compliance Report

Repository: [repository name]
Profile: [repository profile]
Standard version: [version]
Result: [Compliant / Conditionally compliant / Not compliant / Not assessed]
Date: [YYYY-MM-DD]

## Summary

[Short summary of the assessment.]

## Required Fixes

- [Fix 1 / None]
- [Fix 2 / None]

## Not Applicable Items

- [Item]: [reason]

## Validation Performed

- [Validation step 1]
- [Validation step 2]
```

---

# Compliance Rules

- A repository should not be marked `Compliant` if required applicable items fail.
- A `Not applicable` item should include a reason when the reason is not obvious.
- Compliance should be based on the repository's selected profile.
- Compliance should not force unnecessary folders, tests, simulations, or learning context into repositories where they do not apply.
- Documentation should be updated when compliance status changes.

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Repository-Profiles.md`, `README-Template.md`, `Architecture-Enforcement.md`, `Validation-Workflow.md`, and profile-specific domain standards.
