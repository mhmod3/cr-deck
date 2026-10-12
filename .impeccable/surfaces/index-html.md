---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief — index.html (منشئ التشكيلات / M7mod)

**Scope:** the entire single-page deck-builder (app screen, Operate mode; mobile + desktop parity).
**Visitor mode:** Operate — generate a random 8-card + support deck, tune with options, import into Clash Royale via QR/deep-link.
**Constraints:** all behavior, Arabic copy, footer contents, and JS class hooks (deck-grid, card-slot, empty-slot, card-art, animating-placeholder, placeholder-caption, exclude-card, card-img, card-name-label, exclude-overlay, rarity-*, visible/hidden/active/animating/reveal-anim/empty-value) stay as-is; static site, RTL, no framework.

## Direction contract

**THESIS:** the deck is a binder page that gets opened, not a results panel that gets printed — it refuses the category's default arrangement of a dark SaaS card grid with one floating blue button. The page proves the random-generator mechanism by putting the pockets and the reveal cascade in first light.

**OWN-WORLD:** tournament-table midnight ground #14161c, cardstock panels #191c22 with hairline #2a2e37 rules; Lalezar display + Rubik UI + tabular numerals; equal-scale pockets on a shared 4×2 baseline with rarity sleeve edges (slate/orange/purple/gold); elixir pink #e03997 reserved for the generate-and-confirm moment; symmetric around a center axis; with content removed the page still reads as a binder page.

**STORY:** user lands → sees the binder page with 8 empty pockets and the elixir strip → presses إنشاء تشكيلة → pockets fill in a staggered cascade, the elixir strip advances, the average settles → deck is import-ready via the stamped QR block and deep-link.

**FIRST VIEWPORT:** centered ~660px column: M7mod wordmark + Lalezar title + muted subtitle; the binder page panel — header (تشكيلة اليوم + No. stamp), 4×2 equal pockets with rarity sleeves and pocket labels, elixir strip with average + support card on the center axis, option chips, then the event: the pink إنشاء تشكيلة button beside a dashed-stamped QR block; footer as committed.

**FORM:** grounded candidate 3 of the seven (collector's binder world); concept-seed key d6014ee1, mode operate, assigned by roll; code-led build.

**FINISH:** "unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance".
