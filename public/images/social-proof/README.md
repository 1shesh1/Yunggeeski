# Social proof screenshots

Repost screenshots shown in the "Social Proof" section on the home page.

Expected files (referenced from `lib/socialProof.ts`):

- `lara-trump.png` — Instagram post by @laraleatrump — 960×2079
- `donald-trump.png` — Truth Social repost by @realDonaldTrump — 877×1546
- `mandy-patinkin.png` — Instagram reel by @mandypatinkin — 960×2079

Notes:

- **Record the pixel size** in the entry's `width`/`height` when you swap or add
  an image. The captures come from different devices, and the full-size modal
  sizes from those numbers — a stale ratio stretches the screenshot.
- **A missing file does not break the page.** The card falls back to a branded
  placeholder showing the chart title; drop the PNG in at the path above and it
  swaps itself in with no code change.
- **Screenshots are shown whole — nothing is cropped.** The card box is the
  tallest source ratio (960×2079) and images are `object-contain`, so a shorter
  capture letterboxes against the black backdrop rather than losing content.
  Clicking a card opens the screenshot larger in a modal.
- Because of that, a much wider screenshot would letterbox heavily and read as
  small. Prefer portrait captures at roughly phone proportions.
- Served through `next/image`, so delivery is resized and converted to WebP
  automatically. Source PNGs are still large in-repo (~1–3 MB); running them
  through an optimizer before committing a new one is worthwhile.
