---
name: "صفحة جامع البطاقات — M7mod"
description: "Clash Royale deck-builder for the Arab gaming community: a collector's binder page on a night-table ground, one elixir-pink accent doing real jobs, and a signature cascade reveal."
colors:
  bg: "#14161c"
  panel: "#191c22"
  panel-2: "#101216"
  border: "#2a2e37"
  border-2: "#3a3f4a"
  hairline-deep: "#23262e"
  text: "#cfd2d8"
  text-strong: "#f5f1e6"
  text-muted: "#98a0ab"
  text-faint: "#8f98a5"
  white: "#ffffff"
  accent: "#d32f8f"
  accent-soft: "rgba(211, 47, 143, .12)"
  red: "#b0392a"
  error-ink: "#ffb4a8"
  crown: "#333845"
  scrim: "rgba(8, 9, 12, .82)"
  rarity-common: "#b7c1cc"
  rarity-rare: "#ff9d2e"
  rarity-epic: "#b455e0"
  rarity-legendary: "#ffd54a"
  rarity-champion: "#ffb300"
  rarity-support: "#7a8089"
typography:
  display:
    fontFamily: "Lalezar, Rubik, sans-serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0"
  ui:
    fontFamily: "Rubik, Cairo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0"
  numeral:
    fontFamily: "ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "10px"
    letterSpacing: ".08em"
  typeRamp: [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 26, 30, 34, 44]
rounded:
  sm: "2px"
  xs: "3px"
  md: "4px"
  subtle: "5px"
  lg: "6px"
  xl: "10px"
  full: "50%"
  pill: "999px"
spacing:
  sm: "8px"
  md: "14px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "9px 26px 7px"
    width: "240px"
  option-chip:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "7px 12px"
  pocket-slot:
    backgroundColor: "{colors.panel-2}"
    rounded: "{rounded.sm}"
    size: "1 / 1.14"
  round-action:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
    size: "36px"
---

# Design System: صفحة جامع البطاقات (M7mod)

## Overview

**Creative North Star: "صفحة جامع البطاقات" — The Collector's Binder Page.**

The world is a binder page that gets opened, not a results panel that gets printed. Its physical scene: a Clash Royale player at the tournament table in midnight — dark is forced by the scene (players open the tool on a phone, right before queuing a battle), not by mood. The ground is a tinted midnight (#14161c) with a faint cardstock panel language (#191c22 on top of #101216 pocket interiors), and the 8-card deck reads as a collector's page with fixed-scale plates on one shared baseline, not a SaaS card grid.

Mode is **Operate**: this is a task surface, not a marketing page. What that means for the surface — compact single-column density (660px centered column), everything the flow needs (generate → reveal → tune → import via QR/deep-link) sits within one or two viewports on mobile, mobile and desktop are full parity (breakpoint at 550px only adjusts scale, never structure), and feedback is fast and literal: a reveal cascade, a settling meter, a stamped QR. The mystery is the product: the staggered reveal is the moment of the experience and is never shortened or skipped. Confirmed visual rejections: no dark-SaaS-with-one-floating-blue-button default, no colored glows, no framework, no second accent.

The world lends exactly four things to any new surface: the type pairing, the committed-dark palette with reserved accent, Operate-grade density, and the one signature move (cascade + settling meter). Layout and standard controls stay standard.

**Key Characteristics:**

- Committed-dark: tinted midnight ground, tonal layering for depth, neutral black shadows only.
- One saturated accent (elixir pink #d32f8f) reserved for generate/confirm moments and the settle meter; the only other chroma is the six rarity sleeves and one error red.
- Lalezar poster display + Rubik UI workhorse + tabular mono stamps; Arabic letter-spacing stays at 0.
- 4×2 pockets on one shared baseline, symmetric about the center axis, each wearing a 3px rarity sleeve strip.
- Faint 22px halftone dot print texture on the ground — print/cardstock family, 1.8% alpha.

## Colors

A committed-dark palette: a desaturated midnight ground stack, one reserved saturated accent doing real jobs, and a small functional family of rarity chips plus a single error red.

### Primary

- **Elixir Pink / accent** (#d32f8f): the reserved saturated voice. Used only for the generate button, the copy round-button, the active/open-link state, checked option chips (border + `--accent-soft` rgba(211,47,143,.12) fill), the elixir meter fill, the loading bar fill, the caret, and the exclude count badge. It marks the moment of generation, confirmation, and control activation — never decoration.
- **accent-soft** (rgba(211, 47, 143, .12)): the tinted bed for checked chips and hover tints.

### Tertiary (functional data colors)

- **Rarity sleeves:** common #b7c1cc (slate), rare #ff9d2e (orange), epic #b455e0 (purple), legendary #ffd54a (gold), champion #ffb300 (amber), support #7a8089 (steel). Rendered exclusively as the 3px top sleeve strip on pockets and as the 10px bottom label color.
- **Error / change red** (#b0392a): error hairlines, retry/reset outline buttons, excluded-card sleeve and its rgba(176,57,42,.5) overlay with "مستبعدة".

### Neutral

- **Tournament-table midnight / bg** (#14161c): the ground; carries the 22px halftone dot texture (radial-gradient of #f5f1e6 at 1.8% alpha, 1px dot, 22px grid).
- **Cardstock / panel** (#191c22): binder pages — toolbar, deck panel, options panel, loading card, modal.
- **Pocket interior / panel-2** (#101216): the recessed surfaces — empty pockets, chips, round buttons, inputs, meter track base (#23262e sits one step darker still for the track).
- **Hairlines / border** (#2a2e37) and **emphasis hairline / border-2** (#3a3f4a): 1px structural lines; scrollbar-color is border-2 on bg.
- **Ink / text** (#cfd2d8): running text. **Pocket paper / text-strong** (#f5f1e6): warm paper white — titles, values, focus outlines, and the QR stamp background. **Muted** (#98a0ab): labels, footer. **Faint** (#8f98a5): wordmark, pocket counters, placeholders, empty values.

### Named Rules

**The Elixir-Pink Reservation Rule.** Accent pink appears only in generation/confirmation moments (generate button, copy action, open-link) and on control states (checked chips, active exclude, loading fill, meter fill, caret). If the accent is on a surface that isn't an action or a settled measurement, delete it.

**The Rarity-Only Chroma Rule.** The only other saturated colors in the system are the six rarity sleeves and the one error red, and both appear only in data roles (sleeve strip, sleeve label, error state). No new hues; no rarity color drifting into UI chrome.

## Typography

**Display Font:** Lalezar (with Rubik, sans-serif fallback) — loaded via Google Fonts.
**Body Font:** Rubik (with Cairo, system-ui, sans-serif).
**Numeral/Stamp Font:** ui-monospace, Cascadia Mono, Consolas, monospace — tabular figures for counters, percentages, and stamps.

**Character:** Lalezar is the subject's own world: the Arabic gaming poster / YouTube-thumbnail display face — thick, confident, instantly readable at size, the voice of Arab Clash content. Rubik is the geometric workhorse that carries Arabic UI text without strain. The mono stack quarantines all numerals so the "0N · rarity" pocket stamps and elixir averages read as printed tabular figures, not UI numbers.

### Hierarchy

- **Display** (Lalezar 400, 44px/1.1 on desktop, 34px on mobile): the h1 "منشئ التشكيلات"; letter-spacing 0.
- **Headline / section title** (Lalezar 400, 20px): deck panel title "تشكيلة المعركة" with hairline rules on both sides; modal header 22px.
- **Value** (Lalezar 400, 30px, line-height 1; mobile 26px): the elixir average; the "؟" animating placeholder is Lalezar 30px and pulses during its window.
- **Button / poster size** (Lalezar 400, 20px, letter-spacing .02em): the generate button — the single exception to zero tracking (poster tracking on display face only).
- **Body** (Rubik 400, 14px/1.45): the base; labels and hints at 12–13px, weight 500.
- **Stamp / numeral** (ui-monospace, 10–12px, letter-spacing .08–.18em): M7mod wordmark (11px, .18em), pocket counters "01"–"08" (10px, .08em), loading progress (12px, LTR).

**Type ramp (10–44px):** 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 26, 30, 34, 44 — the exact steps used across the surface. Display sizes (18 and up, Lalezar): 18 loading title, 20 section title / generate button, 22 modal header, 26 mobile stat, 30 stat value / "؟", 34 mobile h1, 44 h1. UI (Rubik): 11 labels/options, 12 body + hints, 13 search + sub, 14 base, 15 close glyph.

### Named Rules

**The Zero-Tracking Rule.** Arabic letter-spacing is 0 — no tracking on any Arabic body or UI text. The only tracked faces in the system are the Latin/mono stamps (wordmark .18em, pocket counter .08em, options label 0) and the .02em poster tracking on the Lalezar generate button.

## Layout

Single centered column, max-width 660px (body padding 24px 20px 40px; 14px 12px 28px on mobile), with a 14px vertical rhythm between blocks (container gap). The deck panel is a nested centered column, max-width 520px. Inside it, the deck grid is 4 columns × 2 rows of equal-scale pockets, 8px gap (6px on mobile), and the grid is forced `direction: ltr` so pockets 01–08 read left-to-right inside the RTL page while labels stay Arabic. The elixir band under the grid is symmetric about the center axis: support tower image (44×53) on the axis, the "متوسط الإكسير" label/value pair flanking it, and the full-width meter strip below — the composition stays balanced with content removed (the page still reads as a binder page).

Density is Operate-grade: compact chips (7×12px padding), 12px UI labels, one primary action per panel. The only breakpoint is 550px, and it changes scale, not structure: h1 44→34, generate button min-width 240→200 and 20→18px, grid gap 8→6, stat value 30→26, chips to 2-per-row (flex-basis 46%), popover 240→216, exclusion grid minmax 74→62, modal footer stacks to column.

**The Shared-Baseline Rule.** All eight pockets share one row geometry — fixed aspect (1/1.14, set on the slot so the pocket holds its size even while the art is hidden during the "؟" flicker), one card image scale (`object-fit: contain` on a padded art frame), one 3px sleeve plane. No pocket may scale, float, or break the grid; symmetry about the center axis is load-bearing.

## Elevation & Depth

Depth is tonal first, shadow second. The ground stack layers midnight → cardstock → pocket interior (#14161c → #191c22 → #101216), and the ground carries the print family texture: a faint halftone dot grid (radial-gradient, #f5f1e6 at 1.8% alpha, 1px dots on a 22px grid). Shadows are always neutral black offset+blur — no colored glows, ever.

### Shadow Vocabulary

- **Button lift** (`box-shadow: 0 6px 20px rgba(0,0,0,.45)`): the generate button at rest; hover deepens to `0 10px 28px rgba(0,0,0,.55)` with a -1px lift.
- **Tower drop** (`filter: drop-shadow(0 2px 8px rgba(0,0,0,.55))`): the support tower image, the one element that "floats" off the page.
- **Popover lift** (`box-shadow: 0 18px 44px rgba(0,0,0,.55)`): the stamped copy popover.
- **Modal float** (`box-shadow: 0 24px 60px rgba(0,0,0,.6)`): the exclusion modal over a `rgba(8,9,12,.82)` scrim.

### Named Rules

**The Neutral-Shadow Rule.** Every shadow is neutral black with offset + blur. No accent glow, no rarity glow, no ambient colored light — the accent's rarity is its restraint.

## Shapes

The corner language is small and fixed: 2px on pockets (angular plates), 4px on the generate button and popover action buttons, 6px on chips, inputs, and error/reset outline buttons, 10px on page panels (toolbar, deck, options, popover, modal), 50% on the round action buttons and help icons, plus two incidental small radii — 3px on the exclusion card image and 5px on its excluded overlay. Pill 999px is reserved for the exclude-count badge. Borders are 1px hairlines throughout: #2a2e37 structural, #3a3f4a emphasis, #23262e on pocket cards and the meter track. Dashed hairlines (1px dashed #3a3f4a) mark "waiting" surfaces: empty pockets and the QR stamp. The signature geometry is the **rarity sleeve**: a 3px top strip on each pocket, painted with a two-layer background (linear-gradient strip over panel-2), corners 2px — a sleeve, never a border.

**The 2px Pocket Rule.** Pockets stay angular at 2px corners; the sleeve is a 3px top strip rendered in the background, never a thick border on rounded corners. A pocket with a visible border-width > 1px or a large radius is out of the world.

## Components

### Buttons

- **Shape:** generate button 4px radius; round actions 50% (36px); small outline buttons 4px.
- **Primary (generate):** accent fill + accent 1px border, white Lalezar 20px text, padding 9px 26px 7px (shorter bottom for the display face), min-width 240px, neutral lift shadow.
- **Hover / Focus:** hover = brightness(1.08) + deeper shadow + -1px translate (filter-based, no color swap); focus-visible = 2px paper-white (#f5f1e6) outline, 3px offset.
- **Disabled:** opacity .38, no shadow, `not-allowed`.
- **Round (copy):** the "blue" round is now accent-filled (white icon) — the reserved-accent rule applied to the second real action; default rounds are panel-2 with border-2 hairline, muted icon, hover to text-strong.
- **Ghost (popover):** panel-2 background, border-2 hairline, 4px radius, 12px Rubik 500; the open-link variant is accent-filled.
- **Danger outline (retry / reset-exclude):** transparent with 1px #b0392a border and #ffb4a8 text; hover tints the bed to rgba(176,57,42,.18).

### Chips (options)

- **Style:** panel-2 bed, 1px border hairline, 6px radius, 12px Rubik 500, 7×12px padding, 13px native checkbox with accent-color pink; a 15px circled "؟" help glyph sits at the end, going accent-border/accent-color on hover.
- **State:** checked = accent border + accent-soft (rgba(211,47,143,.12)) fill + paper-white text. Unchecked hover = border-2 only. Mobile: chips stretch to 2-per-row (flex-basis 46%).

### Cards / Pockets (the signature component)

- **Corner Style:** 2px, always.
- **Background:** pocket interior #101216 with a 3px top sleeve strip in the rarity color (sleeve tokens above); 1px #23262e border.
- **Shadow Strategy:** none at rest — pockets are plates, not floating cards.
- **States (the full vocabulary):** **empty** — dashed border-2, crown glyph at 34% (color #333845), slot number "#N" in mono 10px faint; **animating** — a neutral-sleeve "؟" flicker (the rarity sleeve is held at the hairline color while the card is unknown, so no rarity color leaks during the mystery) with the question mark pulsing (Lalezar 30px, `questionPulse` .7s ease-in-out infinite: opacity .35→.8, scale 1→1.12), replacing the art during the pocket's reveal window; **revealed** — card art (`object-fit: contain`, 2px 4px 16px padding) lands with `cardReveal` (.34s cubic-bezier(.2,.8,.2,1), scale .9→1.02→1, opacity .35→1) plus a one-shot paper `inkFlash` (radial #f5f1e6 at 22% alpha, .55s), and the rarity sleeve strip is stamped on; bottom label "0N · rarity-word" (counter via CSS counters, mono 10px .08em); **error** — red hairline (#b0392a) with soft red bed and #ffb4a8 text; **disabled** — opacity .38; **excluded** (in the modal grid) — red sleeve strip + border, rgba(176,57,42,.5) overlay with "مستبعدة" in Lalezar 14px white.
- **Internal Padding:** art frame 2px 4px 16px; label pinned bottom-center 3px.

### Elixir meter (settling measure)

4px track on #23262e; the fill is accent, anchored right, `width: min(calc(var(--avg) * 7%), 100%)` with a .5s cubic-bezier(.2,.8,.2,1) transition — the width is driven by `--avg` set from JS, so the meter settles exactly when the average lands. Empty state shows "—" in text-faint.

### Stamped QR popover

A "stamped slit" card: panel bed, border-2, 10px radius, 240px (216 mobile), 18px 44px neutral shadow, 7px border-2 arrow, opening with .18s opacity+scale(.96→1). The QR sits on a pocket-paper (#f5f1e6) bed with a dashed border-2 hairline and 2px corners — the one place paper-white becomes a surface.

### Exclusion modal

An "opened binder page": rgba(8,9,12,.82) scrim, panel max-width 640 / max-height 90vh, 6px hairline scrollbars (track panel-2, thumb border-2). Search input: panel-2 bed, 6px radius, 13px text, RTL 74px right padding for the "بحث" stamp, caret-color accent, focus border accent. Card grid: auto-fill minmax(74px, 1fr) (62px mobile) of pocket-geometry cells.

### Browser surfaces

Themed from the palette: `color-scheme: dark`; `::selection` accent-soft (rgba(211,47,143,.4)) with white text; scrollbar-color border-2 on bg; caret-color accent; focus rings paper-white on dark surfaces, accent on controls.

### Signature move: the staggered cascade

Eight fixed-scale pockets (aspect 1/1.14, so they hold size while the art is hidden) on one shared baseline reveal in a 45ms × 8 stagger. Each pocket first holds a neutral-sleeve "؟" flicker with a gently pulsing question mark (`questionPulse` .7s: opacity .35→.8, scale 1→1.12) — no rarity color leaks while the card is still unknown. When its window lands, the pocket plays `cardReveal` (.34s cubic-bezier(.2,.8,.2,1): scale .9 → 1.02 overshoot → 1, opacity .35 → 1), a one-shot paper `inkFlash` (radial #f5f1e6 at 22% alpha, .55s), and the rarity sleeve is stamped on. The elixir meter then advances and settles exactly when the average lands. Symmetric about the center axis; with content removed the page still reads as a binder page.

### Supporting micro-motion

Fast, one-shot, transform/opacity-only touches that carry state rather than decorate (80–300ms; no new loops; the cascade stays the only authored sequence):

- **Overlay rise:** the exclusion modal and site modals open with a 140ms scrim fade + 180ms panel `riseIn` (6px, deceleration .2/.8/.2/1); error messages and re-rendered exclusion grids fade in (150–180ms); the loading card settles in the same move; the page container settles once (`ready`, 220ms) when the loading screen hides.
- **Press states:** `:active` on every control — chips/exclude button .985, round copy .9, exclusion cards .96, generate button sinks 1px — 80–100ms, transform only.
- **Settle:** the elixir average pops once (`valueSettle`, 300ms) the instant the meter settles; the support tower image fades in on each swap (`towerIn`, 300ms).
- **Restored decks:** pop in with a 40ms × 8 `cardPopIn` stagger; the loading bar width is smoothed with a 180ms transition.
- **Copy success:** the copy button pulses once (`copyPop`, 250ms) when "تم النسخ!" lands.
- **Reduced motion:** every move above collapses to an instant state change — feedback stays legible, spatial movement goes.

## Do's and Don'ts

### Do:

- **Do** keep Arabic letter-spacing at 0 — tracking applies only to Latin/mono stamps (wordmark .18em, counters .08em) and the .02em on the Lalezar generate button.
- **Do** reserve the accent pink for generation/confirmation moments (generate, copy, open-link), control-activation states (checked chips, active exclude, loading/meter fill, caret), and the settle meter — nothing else.
- **Do** keep pockets at 2px angular corners with the rarity sleeve as a 3px top strip; keep all eight pockets on the shared 4×2 baseline, symmetric about the center axis.
- **Do** use neutral black offset+blur shadows only, and keep the 22px 1.8%-alpha halftone dot texture on the ground.
- **Do** use Lalezar exclusively for display/section titles/values, Rubik for all UI text, and the mono stack for every numeral, counter, and stamp.
- **Do** preserve the JS class hooks, the Arabic copy, and the footer verbatim — new screens join the world, they don't rewrite it.
- **Do** keep micro-motion one-shot and transform/opacity only (80–300ms); every new surface opens with the fast fade + rise vocabulary, and every control answers a press.

### Don't:

- **Don't** let the accent become decoration: no pink on hairlines, glows, hover washes, backgrounds, or a second accent anywhere.
- **Don't** add colored glows or colored drop-shadows — the world is neutral-shadow only.
- **Don't** round or thicken pockets (no large radii, no >1px border); the sleeve is a strip, never a border.
- **Don't** track Arabic text or introduce a second display face.
- **Don't** drift the layout off the shared baseline, break center-axis symmetry, or let standard controls (checkbox, input, button) grow custom shapes — the world lends type, palette, density, and one signature move; layout and standard controls stay standard.
- **Don't** add a framework or build step; this is a static RTL site.
- **Don't** introduce a new looping or decorative animation; the only bounded loop is `questionPulse` during the reveal window. Everything else is one-shot and state-carrying.
