# By Celeste — logo files

## Resolution order (first file that loads wins)

Paths are built in code with `encodeURIComponent`, so spaces in filenames are fine.

1. **`Celeste logo.png`** — primary client mark (URL: `/images/branding/Celeste%20logo.png`)  
2. **`logo-on-light-bg.png`** / **`logo-on-light-bg.svg`** — optional darker-on-light variant  
3. **`logo.svg`**, **`logo.png`**, **`logo.webp`** — generic fallbacks  
4. **`Celeste logo.jpg`** — last resort (JPEG is opaque; can show a slight “box” on white)

## Client JPEG (fallback only)

- **`Celeste logo.jpg`** — used only when none of the files above load.

## Behaviour

- **`BrandLogo`** uses **`object-contain`**, fixed heights (header ~32px → 40px → 48px by breakpoint), and **max-width** so the bar does not overflow on mobile.
- If no file loads, the **text wordmark** “By Celeste” appears so the layout never breaks.

See `frontend/src/config/brandingLogos.ts` for the full ordered list.
