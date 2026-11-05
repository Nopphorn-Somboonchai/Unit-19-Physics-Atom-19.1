# README Template

> Official README template for repositories in the Physics Learning Ecosystem.

Template version: 1.13.0
Standard source: `physics-learning-standard`

---

# [Project Name]

> [Short description of this repository]

---

# 1. Project Identity

This section identifies what this repository is and how it fits into the Physics Learning Ecosystem.

| Field | Value |
| :--- | :--- |
| Repository profile | [learning-unit / interactive-simulation / shared-library / physics-engine / documentation-only / utility-package] |
| Standard source | `physics-learning-standard` |
| Standard version | [physics-learning-standard version / Not applicable] |
| Compliance status | [Not assessed / Compliant / Conditionally compliant / Not compliant] |
| Target learners | [Grade 10 / Grade 11 / Grade 12 / Multiple levels / Not applicable] |
| Course | [Course name and code / Not applicable] |
| Unit | [Unit number and topic / Not applicable] |
| Main topic | [Main topic / Not applicable] |
| Primary UI language | [Thai / English / Thai-English bilingual / Not applicable] |
| Learner data handling | [Local only / exported file / backend submission / no learner data / Not applicable] |
| Maintainer | [Maintainer name / Not applicable] |

Fields that do not apply to this repository SHOULD be marked as `Not applicable`.

Use `Repository-Profiles.md` to select the repository profile.

Use `examples/readme-profile-examples/` when a filled profile-specific example
would make the template easier to adapt.

Use `Standard-Compliance-Checklist.md` to update the compliance status.

---

# 2. Project Summary

[Project Name] is part of the **Physics Learning Ecosystem**.

This repository provides [main purpose of the repository].

It supports physics learning through [explanations / simulations / practice activities / assessments / shared utilities / documentation].

This repository follows the standards defined in `physics-learning-standard`.

When this repository includes physics content, it SHOULD follow `Physics-Standards.md`, `Units-and-Notation.md`, and `Simulation-Standards.md`.

When this repository includes learner-facing Thai-English text, learner data,
or performance-sensitive interactions, it SHOULD follow
`Internationalization-and-Localization.md`, `Security-and-Privacy.md`, and
`Performance-Standards.md` as applicable.

---

# 3. Learning Context

This section describes the learning situation this repository supports.

| Field | Value |
| :--- | :--- |
| Learners | [Target learners / Not applicable] |
| Course | [Course name / Not applicable] |
| Unit or chapter | [Unit or chapter / Not applicable] |
| Main topic | [Main topic / Not applicable] |
| Learning use case | [Classroom / self-study / simulation / assessment / shared development / Not applicable] |

This section MAY be marked as `Not applicable` for shared libraries, engines, utilities, or documentation-only repositories.

---

# 4. Learning Objectives

After using this repository, learners or users should be able to:

- [Objective 1]
- [Objective 2]
- [Objective 3]
- [Objective 4]

Learning objectives SHOULD describe observable outcomes such as explain, calculate, compare, simulate, analyze, or apply.

---

# 5. Physics Scope

This section defines the physics content covered by this repository.

Use `Physics-Standards.md` for physics correctness expectations.

Use `Units-and-Notation.md` for units, variables, constants, and formula notation.

## Concepts

This repository covers:

- [Physics concept 1]
- [Physics concept 2]
- [Physics concept 3]

## Key Formulas

```text
[Formula 1]
[Formula 2]
[Formula 3]
```

## Variables and Units

| Symbol | Meaning | Unit |
| :--- | :--- | :--- |
| [symbol] | [meaning] | [unit] |
| [symbol] | [meaning] | [unit] |
| [symbol] | [meaning] | [unit] |

## Constants

| Symbol | Meaning | Value | Unit | Source or approximation |
| :--- | :--- | :--- | :--- | :--- |
| [symbol] | [meaning] | [value] | [unit] | [source / approximation / Not applicable] |

For high-school mechanics learning activities, use `g = 10 m/s^2` as the default learning approximation near Earth's surface unless this repository documents a precision-focused reason to use a different value.

## Assumptions and Limitations

- [Assumption or limitation 1]
- [Assumption or limitation 2]
- [Assumption or limitation 3]

Physics calculations SHOULD use SI units unless a documented educational reason requires otherwise.

If formulas, constants, or units are simplified for learning, document the simplification clearly.

---

# 6. Learning Features

This section describes what the repository provides for learning.

## Explanations

- [Explanation feature / Not applicable]

## Simulations

- [Simulation feature / Not applicable]

When simulations are included, document the physics model, assumptions, input ranges, and validation cases using `Simulation-Standards.md`.

## Practice Activities

- [Practice feature / Not applicable]

Dynamic or randomized questions SHOULD document parameter rules, constraints, and numerical tolerance when applicable.

Roll-number based or randomized dynamic quizzes SHOULD follow `Dynamic-Quiz-System-Rules.md`.

When a quiz uses student roll number `R`, document the allowed range, parameter-generation rules, safety constraints, tolerance, and whether attempts are reproducible.

When generated parameters can fail constraints, document the fallback strategy: `maxRetries`, retry exhaustion behavior, learner-facing error message, and logging or review data.

## Assessment

- [Assessment feature / Not applicable]

## Timed Exam System

If this repository includes a timed or scored exam, it MUST follow
`Timed-Exam-System-Rules.md`.

Document the exam setup below:

| Field | Value |
| :--- | :--- |
| Exam title | [Example: Scored exam for Grade 12] |
| Content scope | [Concepts, formulas, and applications covered] |
| Number of questions | [Number] |
| Points per question | [Number or scoring table] |
| Total score | [Number] |
| Time limit | [Minutes / Not applicable] |
| Numerical answer rule | [Decimal places, units, and tolerance / Not applicable] |
| Lock or auto-submit rule | [Refresh, tab switch, timeout, or Not applicable] |
| Offline or recovery rule | [Local persistence, recovery flow, sync/export behavior, or Not applicable] |
| Security and privacy rule | [Data minimization, input validation, tamper limits, privacy notes, or Not applicable] |
| Result storage | [Local only / exported file / backend / Not applicable] |

The exam start screen SHOULD follow the start-screen pattern in
`Timed-Exam-System-Rules.md`.

Stored or exported exam session data SHOULD follow
`schemas/assessment-session.schema.json`.

If the exam can be interrupted by refresh, browser close, offline mode, network
loss, or backend failure, document the local persistence scope, recovery flow,
timer continuity rule, and sync/export status labels.

If the exam collects learner data, stores submissions, exports results, or uses
backend submission, document learner data handling using
`Security-and-Privacy.md`.

## Feedback

- [Feedback feature / Not applicable]

Sections that do not apply MAY be removed or marked as `Not applicable`.

---

# 7. Architecture Rules

This repository follows the Domain-Centric Architecture defined by `physics-learning-standard`.

Use `Architecture-Enforcement.md` to review dependency direction, layer responsibilities, and documented exceptions.

Physics logic MUST remain independent from:

- UI code
- Canvas rendering
- DOM APIs
- Browser storage
- Formula rendering libraries
- External frameworks

Physics calculations SHOULD live in the Physics Domain.

UI, Canvas, storage, and formula display SHOULD act as adapters.

Rendering code MUST visualize application state and MUST NOT become the source of physics truth.

If this repository uses a simple single-file or small-file structure, document how physics logic, rendering, UI events, and storage are separated conceptually.

---

# 8. Project Structure

This section describes the actual file and folder structure of the repository.

## Recommended Structure

```text
[project-name]/
|-- README.md
|-- LICENSE
|-- docs/
|-- src/
|-- assets/
|-- tests/
`-- scripts/
```

## Simple Learning Application Structure

Simple browser-based learning applications MAY use:

```text
[project-name]/
|-- README.md
|-- index.html
|-- app.js
|-- input.css
|-- style.css
|-- assets/
`-- docs/
```

## Main Files

| File or folder | Purpose |
| :--- | :--- |
| `README.md` | Project overview and usage guide |
| `index.html` | Main HTML entry point, when applicable |
| `app.js` | Main application script, when applicable |
| `style.css` | Main stylesheet, when applicable |
| `input.css` | Source stylesheet, when applicable |
| `src/` | Source code, when applicable |
| `assets/` | Static assets, when applicable |
| `docs/` | Supporting documentation, when applicable |
| `tests/` | Automated tests, when applicable |

Update this section to match the actual repository.

---

# 9. Usage and Development

This section explains how to use, run, build, and test the repository.

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| [Technology] | [Purpose] |
| [Technology] | [Purpose] |
| [Technology] | [Purpose] |

## How to Run

```text
[Run instructions]
```

## Install

```text
[Install instructions / Not applicable]
```

## Build

```text
[Build instructions / Not applicable]
```

## Test

```text
[Test instructions / Not applicable]
```

## Validate

```text
[Validation instructions / Not applicable]
```

Use `Validation-Workflow.md` to decide which validation steps should be documented.

For a lightweight standard preflight check from `physics-learning-standard`, run:

```powershell
powershell -ExecutionPolicy Bypass -File [path-to-standard]\scripts\validate-repository.ps1 -Target .
```

Use `examples/test-templates/` for reusable physics domain, dynamic question,
and numerical answer validation test patterns when applicable.

If the repository depends on CDN libraries, web fonts, or internet access, document that requirement clearly.

When simulations, Canvas rendering, generated questions, large assets, or
assessment submissions affect responsiveness, document the relevant performance
checks using `Performance-Standards.md`.

---

# 10. Validation, Accessibility, and AI Notes

This section defines the minimum quality checks before the repository is considered ready.

## Validation Checklist

Before release, validate that:

- Physics formulas are correct.
- Units are consistent.
- Symbols and notation are consistent.
- Constants document source or approximation level when applicable.
- Assumptions and limitations are documented.
- Calculations produce reasonable results.
- Simulations behave consistently with the intended physics model.
- Dynamic questions calculate answers from formulas.
- Dynamic quizzes follow `Dynamic-Quiz-System-Rules.md` when applicable.
- Roll-number based quizzes validate `R` and keep one attempt internally consistent.
- Dynamic quiz generators define fallback behavior for failed parameter generation when applicable.
- Timed or scored exams follow `Timed-Exam-System-Rules.md` when applicable.
- Timed or scored exams document interruption recovery and sync/export behavior when applicable.
- Learner data, input handling, storage, export, submission, and secrets follow `Security-and-Privacy.md` when applicable.
- Exam session data follows `schemas/assessment-session.schema.json` when stored or exported.
- Thai-English text, bilingual labels, locale formatting, and UTF-8 encoding follow `Internationalization-and-Localization.md` when applicable.
- Simulations, Canvas rendering, dynamic generation, assets, and assessment submission follow `Performance-Standards.md` when applicable.
- Numerical answers use documented tolerance when applicable.
- Randomized values remain physically reasonable when applicable.
- Documentation matches the actual repository.
- Validation workflow is documented when applicable.
- Project-specific validation commands run successfully when available.
- No unrelated files are included.

## Accessibility Checklist

Before release, validate that:

- Text is readable.
- Color contrast is sufficient.
- Important information is not communicated by color alone.
- Buttons and controls are easy to identify.
- Important interactions are keyboard accessible when applicable.
- Feedback messages are clear and respectful.
- Formulas are readable.
- Exam warnings are visible before the learner starts the exam.
- Exam forms expose labels for name, class, room, and student number fields when those fields are used.
- Motion or animation supports learning and does not distract unnecessarily.

## Internationalization, Security, and Performance Notes

Document these items when applicable:

| Area | Notes |
| :--- | :--- |
| Primary language | [Thai / English / Thai-English bilingual / Not applicable] |
| Locale rules | [Decimal separator, date/time format, export labels, or Not applicable] |
| Learner data | [Collected fields, storage/export/submission behavior, or Not applicable] |
| Privacy limits | [Retention, local-only behavior, third-party services, or Not applicable] |
| Performance checks | [Simulation FPS, generation retry behavior, submission retry behavior, or Not applicable] |

## AI Agent Notes

AI agents working in this repository MUST:

- Read this README before editing.
- Follow `physics-learning-standard`.
- Use the document selection matrix in the standard repository `AGENTS.md` to
  choose task-specific standards without loading unrelated documents.
- Use `Repository-Profiles.md` and `Standard-Compliance-Checklist.md` when assessing repository compliance.
- Use `Architecture-Enforcement.md` when reviewing source-code boundaries.
- Use `Physics-Standards.md` when reviewing physics content.
- Use `Units-and-Notation.md` when reviewing formulas, variables, units, or constants.
- Use `Simulation-Standards.md` when reviewing simulations, dynamic questions, or numerical validation.
- Use `Dynamic-Quiz-System-Rules.md` when reviewing dynamic quizzes, randomized assessments, roll-number based parameter generation, or on-the-fly answer validation.
- Use `Timed-Exam-System-Rules.md` when reviewing timed exams, scored assessments, exam start screens, lock behavior, or submitted exam data.
- Use `Internationalization-and-Localization.md` when reviewing Thai-English text, bilingual labels, encoding, or locale-specific formatting.
- Use `Security-and-Privacy.md` when reviewing learner data, input handling, storage, export, submission, secrets, or privacy behavior.
- Use `Performance-Standards.md` when reviewing simulations, Canvas rendering, dynamic generation, assets, runtime loops, or assessment submission performance.
- Use `Validation-Workflow.md` when reporting validation.
- Keep changes focused on the requested task.
- Preserve architecture boundaries.
- Keep physics logic independent from UI, Canvas, storage, and rendering.
- Avoid hardcoding physics answers when formulas can calculate them.
- Update documentation when behavior changes.
- Report validation performed before completion.

---

# References and License

## References

- [Textbook / curriculum / source]
- [Related standard or repository]
- [Additional reference / Not applicable]

## License

```text
[License name / License pending maintainer decision]
```
