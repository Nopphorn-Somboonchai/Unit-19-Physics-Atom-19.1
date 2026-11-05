# Internationalization and Localization

> Language, locale, encoding, and bilingual text guidance for the Physics
> Learning Ecosystem.

---

# Purpose

Physics learning repositories may use Thai, English, or bilingual text.

Internationalization and localization should make learning clearer, not make
interfaces heavier or harder to maintain.

This document defines how repositories should choose UI language, format
learner-facing text, handle Thai-English labels, and preserve reliable encoding.

---

# Core Rule

Every learner-facing repository should document its primary UI language.

Use one of:

- Thai
- English
- Thai-English bilingual
- Not applicable

Repositories may mix Thai and English when it supports learning, but the same
concept should not switch wording or notation randomly.

---

# Language Selection

Choose the language that best serves the learner group.

Examples:

- Thai classroom learning units may use Thai UI text with English physics terms
  in parentheses.
- Shared libraries may use English API documentation and mark learner-facing UI
  language as `Not applicable`.
- Documentation repositories may be bilingual when the audience includes both
  local maintainers and international contributors.

Do not add bilingual text only for decoration. Use it when it clarifies a term,
supports curriculum alignment, or helps maintainers map Thai classroom language
to standard physics terminology.

---

# Bilingual Labels

When Thai and English are both useful, prefer this pattern:

```text
แรง (Force)
พลังงานจลน์ (Kinetic Energy)
โมเมนตัม (Momentum)
```

Keep the pattern consistent within one repository.

Recommended rules:

- Put the learner's primary language first.
- Put the secondary term in parentheses.
- Use the same English term for the same concept throughout the repository.
- Keep symbols and units language-neutral where practical.
- Avoid long bilingual labels inside compact buttons or controls.

For compact UI controls, use a short primary-language label and explain the
secondary term nearby or in supporting text.

---

# Physics Terms and Notation

Physics symbols, units, and formulas should follow `Units-and-Notation.md`.

Language translation must not change:

- Formula meaning.
- Variable symbol.
- Unit symbol.
- Numerical convention.
- Approximation level.

Example:

```text
น้ำหนัก (Weight), W = mg, unit: N
```

Do not translate unit symbols such as `N`, `kg`, `m/s^2`, or `J`.

---

# Locale Formatting

Repositories should document locale-sensitive formatting when it affects
learning, scoring, export, or teacher review.

Consider:

- Decimal separator.
- Date and time display.
- Name order.
- Class, room, or student number format.
- Export column labels.

For numerical physics answers, prefer explicit rules over locale guessing.

Example:

```text
Enter decimal answers using a dot, such as 12.5 N.
```

---

# Encoding

All Markdown, HTML, JavaScript, JSON, and data files containing Thai text should
be saved as UTF-8.

HTML pages with Thai text should declare UTF-8:

```html
<meta charset="UTF-8">
```

Avoid mojibake. If Thai text appears corrupted, fix the source encoding instead
of copying corrupted text into more files.

---

# Translation Ownership

Repositories with substantial bilingual content should document who owns text
review.

Recommended documentation:

- Primary UI language.
- Secondary language, if any.
- Translation review owner or maintainer.
- Terms that must stay consistent.
- Known untranslated or intentionally English-only content.

Do not treat machine translation as final for learner-facing physics content
without human review.

---

# Accessibility

Localized text must remain accessible.

Check that:

- Labels remain understandable when read by assistive technology.
- Long bilingual labels do not overflow controls.
- Language changes do not hide error messages or warnings.
- Important exam rules remain clear in the learner's primary language.

Use `Accessibility.md` and `UI-Guidelines.md` for interface review.

---

# Review Checklist

| Check | Question |
| :--- | :--- |
| Primary language | Does the README document the primary UI language or mark it `Not applicable`? |
| Bilingual consistency | Are Thai-English labels formatted consistently? |
| Physics notation | Do translations preserve symbols, units, formulas, and approximation level? |
| Locale rules | Are decimal, date, identity, or export formats documented when they matter? |
| Encoding | Are files with Thai text saved and rendered as UTF-8? |
| Accessibility | Do translated labels and messages remain readable and usable? |

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Units-and-Notation.md`, `UI-Guidelines.md`,
`Accessibility.md`, `README-Template.md`, and `Timed-Exam-System-Rules.md`.
