# Performance Standards

> Performance, responsiveness, rendering, and submission reliability guidance
> for the Physics Learning Ecosystem.

---

# Purpose

Performance should protect the learning experience.

Physics simulations, Canvas rendering, dynamic questions, and assessment
submission should remain responsive enough that learners can focus on the
concept instead of waiting for the interface.

This document defines baseline performance expectations without requiring heavy
optimization in small repositories.

---

# Core Rule

Optimize for learning clarity first.

Improve performance when slow rendering, long generation, large assets, network
submission, or heavy computation harms usability, fairness, or reviewability.

Do not move physics truth into rendering code for performance reasons.

---

# Performance Budget

Repositories with interactive simulations, large visualizations, generated
questions, timed exams, or backend submission should document practical
performance expectations.

Useful budget examples:

- Supported device class or browser.
- Target frame rate for animation.
- Maximum acceptable generated-question wait time.
- Maximum acceptable assessment submission wait time.
- Large asset size limits.
- Offline or retry behavior for network submission.

Small static repositories may mark performance budget as `Not applicable`.

---

# Simulation Performance

Simulation performance should preserve the documented physics model.

Recommended practices:

- Keep physics state updates separate from rendering.
- Pause or throttle simulation loops when the activity is hidden or inactive.
- Prefer fixed or documented time steps for numerical stability.
- Avoid unbounded loops during generated question or simulation setup.
- Validate known cases after performance changes.
- Document simplifications that affect accuracy or visual scale.

If performance optimizations change numerical behavior, update
`Simulation-Standards.md` documentation and validation cases.

---

# Canvas Rendering Performance

Canvas code should draw only what is needed for the current state.

Recommended practices:

- Minimize unnecessary redraws.
- Reuse calculated coordinates when practical.
- Avoid avoidable object creation inside animation loops.
- Avoid resizing Canvas every frame.
- Keep text labels readable at supported sizes.
- Stop animation loops when the simulation is stopped or unmounted.

Canvas performance work must keep rendering inside adapter layers and must not
make Canvas code the source of physics truth.

---

# Dynamic Generation Performance

Dynamic question generation should fail predictably instead of looping
indefinitely.

Use `Dynamic-Quiz-System-Rules.md` for `maxRetries`, retry exhaustion, learner
messages, and review logging.

Generation should finish before a timed exam timer starts.

If generated parameters require expensive checks, document:

- Retry limits.
- Failure message.
- Logged review fields.
- Known worst-case behavior when practical.

---

# Assessment Submission Performance

Timed or scored exams should keep submission behavior understandable under slow
or unreliable networks.

Recommended practices:

- Do not block final scoring forever while waiting for a network response.
- Preserve completed session data before retrying submission when practical.
- Show pending, failed, local-only, or synced status clearly.
- Keep retry behavior deterministic and documented.
- Avoid duplicate submissions, or mark duplicates for review.

Use `Timed-Exam-System-Rules.md` and `Security-and-Privacy.md` for recovery,
sync/export status, learner data, and review fields.

---

# Assets and Loading

Assets should support learning without unnecessary weight.

Recommended practices:

- Use appropriately sized images and media.
- Avoid loading unused libraries.
- Document required internet access, CDN dependencies, fonts, or external
  services.
- Provide a fallback or clear message when required assets cannot load.

Large assets are acceptable when they clearly improve learning and are
documented.

---

# Measurement and Validation

Performance validation should match repository risk.

Examples:

- Manual browser check on supported devices.
- Frame rate or responsiveness check for simulations.
- Test for retry exhaustion in dynamic generation.
- Submission retry or offline behavior test for assessments.
- Build or bundle size check when a repository has a build system.

Report what was checked and any known limitations.

---

# Review Checklist

| Check | Question |
| :--- | :--- |
| Budget | Does the repository document practical performance expectations when needed? |
| Responsiveness | Do key interactions remain usable on supported devices? |
| Simulation loop | Are updates bounded, pausable, and separate from rendering? |
| Canvas rendering | Does Canvas avoid unnecessary redraws and preserve adapter boundaries? |
| Dynamic generation | Are retry limits and failure behavior documented? |
| Submission | Are slow, failed, or duplicate submissions handled and reviewable? |
| Assets | Are large or network-dependent assets justified and documented? |
| Validation | Does validation report include performance checks when performance affects learning or assessment fairness? |

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Simulation-Standards.md`, `Canvas-Guidelines.md`,
`Timed-Exam-System-Rules.md`, `Dynamic-Quiz-System-Rules.md`,
`Validation-Workflow.md`, and `Accessibility.md`.
