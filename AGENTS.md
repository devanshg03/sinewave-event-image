<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- **Product:** `event-backdrop` is a fully client-side Next.js 16 (App Router) editor. There is no backend, database, API route, or env var/secret to configure — all image processing and PNG export run in the browser via Canvas 2D.
- **Run:** `npm run dev` from the repo root starts the dev server (Turbopack) on http://localhost:3000. Scripts are in `package.json` (`dev`, `build`, `start`).
- **Lint/tests:** no lint or test scripts/config exist. For type safety, run `npx tsc --noEmit` (not wired into `package.json`).
- **`reference/image-to-sinewave-effect/`** is a separate, optional prototype app with its own deps (pnpm lockfile) and is excluded from the root `tsconfig.json` build. It is not needed to run the main product; don't install it unless working on it.
- **Manual testing:** exercise the real flow in a browser — Open Image → wavy-line effect renders → tweak preset/sliders → toggle to Backdrop mode → edit copy → Export Backdrop (downloads `event-backdrop.png` at 3840×2160). Just loading the page is not sufficient coverage.
