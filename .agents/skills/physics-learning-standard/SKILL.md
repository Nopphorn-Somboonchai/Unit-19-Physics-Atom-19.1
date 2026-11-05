---
name: physics-learning-standard
description: Official engineering standards, architectural guidelines, folder structures, coding standards, canvas/UI guidelines, formula display standards, internationalization, privacy/security, performance benchmarks, and AI rules for the Physics Learning ecosystem (v1.13.0). Activate this skill whenever developing, refactoring, or planning interactive physics portals, simulators, or quiz modules.
---

# ⚛️ Physics Learning Standard (v1.13.0)

> **Engineering Standards & Reference Architecture for the Physics Learning Ecosystem**

This skill defines the official engineering standards, reference architecture, and development guidelines for all physics learning modules.

---

## 🏛️ Core Architectural Principles

1. **Domain First**: The Physics Domain is the center of the system. Educational logic and scientific calculations must remain strictly independent of UI, Canvas rendering, or external frameworks.
2. **Separation of Concerns**:
   - **Physics Domain** (`src/physics/`): Pure calculation functions and physics models ($c = f\lambda$, $I = I_0 \cos^2\theta$, $E = hf$).
   - **Application Services** (`src/application/`): Simulator orchestrators, workflow control, quiz/exam logic.
   - **Adapters** (`src/adapters/`): Canvas rendering (`canvas/`), KaTeX formula rendering (`formula/`), LocalStorage (`storage/`), UI controls (`ui/`).
   - **Shared & Utilities** (`src/shared/`, `src/utils/`): Constants, RNG, helper functions.
3. **Dependency Rule**: Dependencies always flow inward toward the Physics Domain:
   `UI -> Adapters -> Application Services -> Physics Domain`
4. **Learning First**: Every engineering decision should prioritize educational clarity over technical complexity.
5. **Accessibility & Governance**: Ensure keyboard navigation, Thai-English internationalization, learner data privacy, and optimized runtime performance.

---

## 📁 Standard Folder Structure (`src/`)

```text
src/
├── physics/          # Pure physics models & formula solvers (No DOM/Canvas)
├── application/      # Simulator orchestrators & quiz/exam logic
├── adapters/
│   ├── canvas/       # Canvas 2D rendering & vector plotters
│   ├── formula/      # KaTeX LaTeX formula rendering
│   ├── storage/      # LocalStorage score persistence
│   └── ui/           # DOM controls, tabs, modals
├── shared/           # Physics constants & app configuration
└── utils/            # RNG, number formatting, input validation
```

---

## 📚 Detailed Standard References (v1.13.0 Baseline)

For detailed guidelines on specific topics, refer to the files in the `references/` directory:

- 📖 [Principles.md](references/Principles.md) — Core engineering philosophy
- 🏗️ [Architecture.md](references/Architecture.md) — Layered reference architecture & dependency rules
- 🛡️ [Architecture-Enforcement.md](references/Architecture-Enforcement.md) — Architectural boundary enforcement & import rules
- 📁 [Folder-Structure.md](references/Folder-Structure.md) — Standard layout rules for repository and source level
- 🏷️ [Repository-Profiles.md](references/Repository-Profiles.md) — Repository profiles and compliance requirements
- 🔬 [Physics-Standards.md](references/Physics-Standards.md) — Scientific modeling, determinism, and precision guidelines
- 🕹️ [Simulation-Standards.md](references/Simulation-Standards.md) — Interactive canvas physics simulation standards
- 📝 [Dynamic-Quiz-System-Rules.md](references/Dynamic-Quiz-System-Rules.md) — Rules for dynamic question generators, fallback strategies & assessment
- ⏱️ [Timed-Exam-System-Rules.md](references/Timed-Exam-System-Rules.md) — Rules for scored, timed exam systems, start screen patterns & session recovery
- 📐 [assessment-session.schema.json](references/schemas/assessment-session.schema.json) — Assessment session result data schema
- 🌐 [Internationalization-and-Localization.md](references/Internationalization-and-Localization.md) — Thai-English bilingual labels, locale formatting & UTF-8 encoding
- 🔐 [Security-and-Privacy.md](references/Security-and-Privacy.md) — Learner data privacy, input sanitization, export integrity & local storage rules
- ⚡ [Performance-Standards.md](references/Performance-Standards.md) — Simulation FPS, dynamic question generation limits & asset optimization
- 📏 [Units-and-Notation.md](references/Units-and-Notation.md) — SI unit conventions and mathematical notation
- 💻 [Coding-Standards.md](references/Coding-Standards.md) — ES2025+ standards, module rules, pure functions
- 🏷️ [Naming-Conventions.md](references/Naming-Conventions.md) — kebab-case for files, camelCase for vars, UPPER_SNAKE for constants
- 🎨 [Canvas-Guidelines.md](references/Canvas-Guidelines.md) — HTML5 Canvas rendering standards & coordinate systems
- 🖥️ [UI-Guidelines.md](references/UI-Guidelines.md) — Visual hierarchy, learning feedback, interactive controls
- 📐 [Formula-Display.md](references/Formula-Display.md) — Mathematical notation, KaTeX guidelines, SI units
- ♿ [Accessibility.md](references/Accessibility.md) — Readability, contrast, keyboard navigation, cognitive clarity
- ✅ [Standard-Compliance-Checklist.md](references/Standard-Compliance-Checklist.md) — Checklist for verifying standard compliance
- 🔄 [Validation-Workflow.md](references/Validation-Workflow.md) — Workflow for standard compliance validation
- 🤖 [AI-Agent-Rules.md](references/AI-Agent-Rules.md) — Rules for AI-assisted development and architectural preservation
- 📜 [Decision-Records.md](references/Decision-Records.md) — Architectural Decision Records (ADR index 0001-0014)
- 📜 [ADR Folder](references/adr/) — ADR records 0001-0014
- 🛠️ [Validation Scripts](references/scripts/) — PowerShell scripts (`validate-repository.ps1`, `validate-standard.ps1`) for compliance validation


