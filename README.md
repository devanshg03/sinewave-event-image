# Event Backdrop

A browser-based editor for turning speaker photos into Cursor-branded event backdrops. Upload a portrait, apply a retro sine-wave scan-line duotone, then compose a 4K backdrop with headline, subhead, name, and role — ready for livestreams, stage screens, and social cards.

<p align="center">
  <img src="public/backdrop-example.png" alt="Example Cursor event backdrop with Live Build Session headline and stylized speaker portrait" width="900" />
</p>

<p align="center"><em>Example export: Cursor lockup, event copy, and a sine-wave portrait on a 16:9 backdrop.</em></p>

## What it does

The app has two linked modes:

1. **Image** — Process a photo into the signature wavy-line duotone look (crop, color presets, effect sliders).
2. **Backdrop** — Drop that processed image into a fixed Cursor layout and edit the on-canvas copy, then export a 4K PNG.

Everything runs client-side in the browser (canvas + Web APIs). No upload server is required.

## Screenshots

### Image mode

Tune the sine-wave effect before composing the backdrop. Crop, pick a color preset, and adjust line frequency, thickness, wave amplitude, contrast, and brightness. Export the effect alone as PNG, or switch to Backdrop once you’re happy with the look.

![Image mode editor with sine-wave portrait preview and effect controls](public/editor-image-mode.png)

### Backdrop mode

Compose the full event card: Cursor lockup, headline/subhead on the left, 4:5 portrait on the right with name and role captions under the image. Copy updates preview live; **Export Backdrop** downloads a 3840×2160 PNG.

![Backdrop mode editor with Community Building card and copy fields](public/editor-backdrop-mode.png)

## Quick start

Requirements: Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## How to use

### 1. Open an image

- Click **Open Image** (or **Open** after a file is loaded), or drop a file onto the empty stage.
- Supported: any browser-readable image (`image/*`). Processing stays local.

### 2. Crop (optional)

In **Image** mode, the right sidebar **Crop** section offers:

| Aspect | Typical use |
| --- | --- |
| Free | Unconstrained |
| 1:1 | Square avatars / thumbs |
| 4:5 | Matches the backdrop portrait frame |
| 3:4 | Portrait stills |
| 16:9 / 9:16 | Landscape / vertical frames |

Use **Crop** to enter the cropper, **Apply** / **Cancel** to commit or discard, and **Reset** to restore the original upload.

> Tip: Prefer **4:5** when the photo will sit in a backdrop — that matches the portrait slot in the layout.

### 3. Style the sine-wave effect

**Color presets** (quick pairs):

| Preset | Foreground | Background |
| --- | --- | --- |
| Orange (default) | `#FF6B35` | `#8B2500` |
| Tan | `#D4A574` | `#5C4A32` |
| Yellow-Green | `#E6D84C` | `#4A5C23` |
| Blue | `#6B8CFF` | `#1A2A5C` |
| Purple | `#A78BFA` | `#3B2D5C` |
| Green | `#4ADE80` | `#1A3D2E` |

**Effect** controls:

| Control | Range | Role |
| --- | --- | --- |
| Foreground / Background | Hex + picker | Duotone ink and field colors |
| Line frequency | 1–10 | How dense the scan bands feel |
| Line thickness | 2–40 px | Band height / stroke weight |
| Wave amplitude | 0.5–4 | How much the lines undulate |
| Contrast | 0.5–2 | Separates lights and darks before banding |
| Brightness | −50–50 | Overall lift or crush |

The preview updates as you change settings. **Export PNG** downloads `sine-wave-image.png`.

### 4. Build the backdrop

Switch the header toggle to **Backdrop** (enabled after a processed image exists).

Edit the sidebar fields:

| Field | On canvas |
| --- | --- |
| Headline | Large title (left) |
| Subhead | Secondary line under the title |
| Name | Caption under the portrait (left) |
| Role | Caption under the portrait (right) |

The stage shows a live composite. **Export Backdrop** downloads `event-backdrop.png` at **3840×2160** (4K). Layout is authored at 1920×1080 design units and rendered at 2× for sharp type and logo.

## Backdrop layout

Fixed composition (design space 1920×1080):

- **Background:** `#14120A`
- **Brand:** Cursor lockup (`public/brand/cursor-lockup.svg`), 80px inset from the top-left
- **Type:** Headline white, subhead/role grey (`#7A7972`)
- **Portrait:** 4:5 cover crop on the right with 16px corner radius; name + role captions below
- **Title block:** Vertically centered against the portrait stack, word-wrapped within the left column

## Project structure

```
app/
  page.tsx              # Editor shell: modes, crop, effect, backdrop, export
  layout.tsx            # Metadata + fonts
components/
  image-uploader.tsx    # Empty-state dropzone
  image-cropper.tsx     # react-easy-crop stage
  crop-controls.tsx     # Aspect + crop actions
  color-presets.tsx     # Duotone swatches
  effect-controls.tsx   # Colors + effect sliders
  mode-toggle.tsx       # Image ↔ Backdrop
  backdrop-controls.tsx # Headline / subhead / name / role
  backdrop-stage.tsx    # Backdrop preview
lib/
  process-sine-wave.ts  # Scan-line duotone (canvas)
  effect-settings.ts    # Defaults + color presets
  crop-image.ts         # Crop → data URL
  crop-aspects.ts       # Aspect presets
  backdrop.ts           # 4K canvas compositor
public/
  brand/cursor-lockup.svg
  editor-image-mode.png
  editor-backdrop-mode.png
  backdrop-example.png
```

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com)
- [react-easy-crop](https://github.com/ValentinH/react-easy-crop) for cropping
- Canvas 2D for the sine-wave effect and backdrop export

## Notes

- Processing and export happen entirely in the browser; large source images are downscaled during the sine-wave pass (max dimension 800px) for responsive preview performance.
- Backdrop mode uses the **processed** image, not the raw upload — finish crop and effect settings in Image mode first.
- Brand assets (lockup) live under `public/` and are loaded by the canvas renderer at export time.
