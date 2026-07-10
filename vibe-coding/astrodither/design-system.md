# AstroDither Design System

Source: https://astrodither.robertborghesi.is/

## Design Read

AstroDither is an experimental WebGPU art site. It behaves less like a landing page and more like an interactive visual instrument: a full-screen rendered scene, sparse lab-style HUD typography, audio-reactive motion, low-resolution signal artifacts, and neon chaos.

## Core Principle

The interface is not the product. The canvas is the product.

UI elements should stay thin, monochrome, and informational. The visual identity comes from the rendered scene: pixel dithering, fluid displacement, wireframe fragments, neon bloom, and unstable signal-like motion.

## Palette

| Token | Value | Usage |
| --- | --- | --- |
| `--color-bg` | `#080808` | Page and canvas background |
| `--color-text` | `#f7f8f9` | HUD text, dividers, links |
| `--color-muted` | `rgba(247, 248, 249, .55)` | Secondary HUD text |
| `--color-panel` | `rgba(0, 0, 0, .52)` | Entry label and info overlays |
| `--color-hand-pink` | `#ff4fc3` | Dithered hand cells |
| `--color-hand-violet` | `#8f63ff` | Dithered hand shadow cells |
| `--color-hand-grey` | `#85858f` | Low-light dither cells |
| `--color-neon-cyan` | `#29ffe4` | Flying fragments and bloom |
| `--color-neon-lime` | `#d7ff24` | Flying fragments and bloom |
| `--color-neon-blue` | `#5eb8ff` | Flying fragments and bloom |
| `--color-neon-orange` | `#ff9d36` | Flying fragments and bloom |

Do not use gradients as the main design device. Color should appear as emitted light, particles, and dithered pixels, not as decorative UI backgrounds.

## Typography

Primary font: `Azeret Mono`, fallback to `ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas`, monospace.

Text rules:

- Use uppercase labels.
- Keep body copy small and dense.
- Use tabular numbers for timers and speed values.
- Avoid hero-scale typography.
- Avoid marketing copy blocks in the first viewport.

Suggested scale:

| Token | Size | Usage |
| --- | --- | --- |
| `--text-hud` | `12px-14px` | Main HUD labels |
| `--text-panel` | `11px-12px` | Info panel copy |
| `--text-entry` | `12px-14px` | Click-to-enter prompt |

## Layout

The page uses a fixed full-screen canvas with a fixed HUD layer above it.

Desktop grid:

- 12 columns.
- Outer padding around `40px-45px`.
- Top HUD and bottom HUD align to the same grid.

Mobile grid:

- 6 columns.
- Outer padding around `22px`.
- Keep HUD labels short and allow non-critical copy to hide.

HUD placement:

- Top-left: author/logo + divider + `LEARN MORE`.
- Top-right: `ASTRO DITHER`.
- Bottom-left: timer.
- Bottom-right: speed control.
- Center/near pointer: click-to-enter audio prompt.

## Visual Language

### Canvas Scene

- Full-bleed black scene.
- Central dithered hand model or hand silhouette.
- Hand should feel reconstructed from a broken digital signal.
- Use visible square cells, not smooth gradients.
- Hand motion should be continuous and slow, with slight rotation.
- Background contains many neon wireframe fragments, arrows, dust pieces, and streaks.
- Particles should vary in depth, scale, brightness, and speed.

### Dithering

Original behavior uses a low-resolution render target and icon texture sampling. For approximation:

- Use a fixed cell size around `10px-14px`.
- Quantize brightness into limited shade bands.
- Use black gaps between cells.
- Favor magenta, violet, grey, and white.
- Keep dithering strongest on the hand, not the whole UI.

### Motion

Motion should feel signal-driven:

- Ambient drift is always active.
- Pointer movement leaves a fluid-like distortion wake.
- Holding or dragging increases time scale.
- Releasing eases speed back to normal.
- Audio or simulated kick creates short brightness pulses.

Suggested timings:

| Motion | Timing |
| --- | --- |
| UI reveal | `1s-2s`, delayed after enter |
| Info panel reveal | `500ms-700ms`, radial mask |
| Speed return | damped, around `800ms-1200ms` |
| Kick flash | `120ms-180ms` |
| Hand rotation | slow continuous loop |

## Interaction Patterns

### Enter

Initial state shows:

`[:: CLICK TO ENTER + ENABLE AUDIO ::]`

Clicking enters the experience. If audio is unavailable, continue with simulated pulse.

### Speed Control

Desktop:

- Hold or drag to increase speed.
- Speed value ramps from `1.00x` toward high values.
- Particle velocity, bloom, trails, and scene jitter increase with speed.

Touch/mobile:

- Tap toggles temporary speed burst.

### Learn More

Clicking `LEARN MORE` opens a left-side information panel.

Panel behavior:

- Reveals from top-left using a radial mask.
- Background underneath dims and blurs.
- Copy stays small, uppercase headings only.
- `CLOSE` hides the panel.

## Components

### HUD Link

Small uppercase text, no button chrome. On hover, font weight increases or opacity changes.

### Divider

Single vertical white line, `1px`, same height as text line.

### Info Panel

No card radius. No shadow. Use dimming, blur, and mask reveal instead of card styling.

### Canvas Objects

Use object families rather than UI components:

- Dithered hand cells.
- Wireframe debris.
- Neon streaks.
- Fluid ripples.
- Bloom flashes.
- Time-scale hint strip.

## Implementation Notes

Preferred high-fidelity implementation:

- Three.js renderer.
- WebGPU or WebGL fallback.
- GLTF hand model.
- InstancedMesh for debris.
- Low-resolution framebuffer for fluid.
- Postprocessing chain for displacement, dither, bloom, and chromatic aberration.

Practical standalone approximation:

- Native Canvas 2D.
- Procedural hand silhouette sampled into square cells.
- Pointer-driven ripple field.
- Neon particles with additive-looking glow.
- CSS HUD and radial info mask.

## Avoid

- Traditional landing-page hero sections.
- Feature cards.
- Gradient-orb backgrounds.
- Rounded glossy panels.
- Large marketing headlines.
- Smooth realistic hand material.
- UI elements competing with the canvas.

