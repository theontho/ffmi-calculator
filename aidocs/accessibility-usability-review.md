# Accessibility and usability review

## Scope

This review covers the calculator's production static export at desktop and
mobile Chromium sizes. It combines keyboard inspection, responsive interaction
checks, WCAG 2.0/2.1 A and AA axe scans, and a heuristic pass over terminology
and information hierarchy. It is not a participant study.

## Findings and changes

- The former title emphasized a monthly lean-mass rate even though the product
  now covers FFMI, body composition, muscle gain, and fat loss. It was replaced
  with a task-oriented title and a one-sentence introduction.
- Uncertainty settings add cognitive load, so they live in the existing
  advanced disclosure. Three measurement-oriented presets reduce data entry
  while retaining editable numeric ranges.
- Shaded regions cannot rely on color alone. Each graph now has a text legend,
  an accessible chart description naming the active uncertainty, and numeric
  ranges in the hover tooltip.
- Sensitivity wording consistently says "what-if envelope" and "not a confidence
  interval" to prevent a probabilistic interpretation.
- Controls retain large mobile range targets, visible labels, native keyboard
  behavior, and a disabled initialization state that prevents pre-hydration
  input loss.
- A dedicated feedback issue form gives users a structured way to report
  confusing language, mobile problems, and accessibility barriers.

## Automated regression gate

Playwright exercises the production GitHub Pages export in desktop and mobile
Chromium. The suite now asserts that sensitivity presets persist in shared URLs,
both charts expose useful accessible descriptions, and no serious or critical
axe violations occur in the main calculator.

## Remaining evidence gap

Automated and heuristic reviews cannot establish whether first-time users
correctly understand FFMI, the four loss-speed curves, or sensitivity envelopes.
The feedback form can collect field reports, but a future moderated study should
observe at least five first-time users completing one composition and one
fat-loss comparison task.
