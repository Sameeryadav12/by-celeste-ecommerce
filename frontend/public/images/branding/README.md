# By Celeste — logo files

## Primary file (client)

The live site uses the client asset:

- **`Celeste logo.jpg`** (URL: `/images/branding/Celeste%20logo.jpg`)

Paths are built in code with `encodeURIComponent`, so spaces in the filename are fine.

## Optional alternates (same folder)

If the mark is **too light** on the **white header**, add a darker variant and name it:

- **`logo-on-light-bg.png`** or **`logo-on-light-bg.svg`**

The app tries that **after** `Celeste logo.jpg` and before generic `logo.svg` / `logo.png`.

## Generic fallbacks

- `logo.svg`, `logo.png`, `logo.webp` — used if the client file is removed or renamed.

## Behaviour

- **`BrandLogo`** uses **`object-contain`**, fixed heights (header ~32px → 40px → 48px by breakpoint), and **max-width** so the bar does not overflow on mobile.
- If no file loads, the **text wordmark** “By Celeste” appears so the layout never breaks.

See `frontend/src/config/brandingLogos.ts` for the full ordered list.
