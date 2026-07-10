# Utopia Tokyo Design System

Source: https://www.utopiatokyo.com/

## Design Read

Utopia Tokyo is an immersive cyberpunk archive about Japanese masks. The visual system mixes a dystopian Tokyo surveillance console, museum database, glitch terminal, and ritual mask mythology. It should feel like entering a restricted cultural archive rather than browsing a normal landing page.

## Core Principles

- Full-screen cinematic sections, not card-heavy marketing blocks.
- Sharp geometry: square corners, thin grid lines, corner brackets, clipped red frames.
- High contrast: near-black base, cream text, vivid red warnings and active states.
- Text behaves like system output: coordinates, hashes, version labels, brackets, scrambled letters.
- Motion is part of the UX: warning -> boot sequence -> reveal -> archive interaction.
- Strong effects must have Safe Mode and reduced-motion fallback.

## Color Tokens

```css
:root {
  --color-black: #14171f;
  --color-black-deep: #050508;
  --color-cream: #ebe8e0;
  --color-red: #ff1919;
  --color-cyan: #00f3ff;
  --color-muted: rgba(235, 232, 224, 0.56);
  --color-line-dark: rgba(20, 23, 31, 0.42);
  --color-line-light: rgba(235, 232, 224, 0.28);
}
```

Usage:

- Backgrounds: `--color-black` and `--color-black-deep`.
- Text on dark: `--color-cream`.
- Primary action, warning, selected states: `--color-red`.
- Glitch artifacts only: `--color-cyan`; do not use it as a normal CTA color.
- Lines are 1px and low opacity unless selected.

## Typography

Original stack:

- Primary: `PPMori, Arial, sans-serif`
- Secondary pixel: `Zpix, Arial, sans-serif`
- Tertiary pixel/display: `Neopixel, Arial, sans-serif`

Approximation stack:

```css
:root {
  --font-display: "Arial Narrow", "Helvetica Neue", Arial, sans-serif;
  --font-body: Arial, sans-serif;
  --font-pixel: "Courier New", ui-monospace, monospace;
}
```

Rules:

- Display headings are uppercase, compressed, very large, and tight.
- Metadata uses pixel/mono type at 10-13px.
- Body copy is short, balanced, and never overly friendly.
- Use fragmented emphasis inside words: `U<strong>T</strong>O<strong>P</strong>IA`.
- Avoid rounded friendly type, soft SaaS copy, and emoji.

## Layout System

Breakpoints:

- Mobile: `< 768px`
- Tablet: `768px - 991px`
- Desktop: `>= 992px`

Grid:

- Page uses full-width sections.
- Inner layout often uses 12-column or asymmetrical CSS grid.
- Borders define the system: top/bottom/left/right hairlines.
- Important modules can use `min-height: 100dvh`.

Section rhythm:

1. Experience warning modal
2. Boot/preloader
3. Hero archive screen
4. Story/introduction band
5. Mask explorer
6. Inner mask generator
7. Footer mask wall

## Component Patterns

### Warning Modal

- Fixed full-screen overlay.
- Cream panel with red/black bracket buttons.
- Copy warns about high-contrast effects and rapid transitions.
- Two choices: `[ USE SAFE MODE ]` and `[ ENABLE GLITCH EFFECT ]`.

### Command Button

```css
.command-button {
  border: 1px solid currentColor;
  border-radius: 0;
  text-transform: uppercase;
  font-family: var(--font-pixel);
  letter-spacing: 0.02em;
  padding: 0.9rem 1.1rem;
}
```

Button labels should use brackets: `[ ENTER WEBSITE ]`, `[ GRID ]`, `[ RESET ]`.

### Frame Corners

Every important media or action frame can have four separate corner marks. Keep them thin, mechanical, and square.

### Hero

- Top navigation is small and single-line.
- Hero includes coordinates, country label, version, and command CTA.
- Main title is massive and fragmented.
- Background includes grid, scanlines, noise, and one red clipped frame.
- Image/3D area can be an empty placeholder while assets are missing.

### Mask Explorer

States:

- `inactive`: low opacity, muted border.
- `hovered`: opacity 1, red frame, small transform.
- `selected`: red background or red border, detail content updates.

Views:

- Grid: image placeholders as archive tiles.
- List: dense rows with Japanese label and stats.
- Modal/detail: one selected mask with description and stat matrix.

Mask data fields:

- English name
- Japanese label
- Description
- Strength
- Intellect
- Agility
- Spirit
- Vitality
- Ferocity

### Stats

- Use small square cells or linear segmented bars.
- Active cells use red.
- Labels include English and optional Japanese text.

### Footer Mask Wall

- Horizontal marquee of mask tiles.
- Hover reveals tooltip with mask name.
- Footer contains oversized `UTOPIA TOKYO` typography and version label.

## Motion System

Preferred libraries for full rebuild:

- GSAP
- ScrollTrigger
- ScrambleText
- Flip
- Lenis

Standalone approximation:

- CSS keyframes for scanlines, glitch shift, marquee.
- JavaScript for modal choice, text scramble, view switching, random generator.

Motion rules:

- Preloader reveals by opacity and clipped panels.
- Scramble text lasts 600-1400ms.
- Hover transitions are fast: 120-300ms.
- View transitions use FLIP-like position shifts: 500-800ms.
- Scroll reveal uses upward movement, opacity, and line drawing.
- Glitch bursts are intermittent, not constant.

Safe Mode:

- Disable rapid glitch flashes.
- Keep static scanline/noise at low opacity.
- Respect `prefers-reduced-motion: reduce`.

## Accessibility Rules

- Warning modal is required before intense effects.
- Provide a Safe Mode.
- Support keyboard navigation for mask items and detail modal.
- Use `aria-live` for selected mask changes.
- Avoid relying on color alone; selected states also change borders/labels.
- Keep button text contrast high.

## Rebuild Prompt

```text
Create an immersive cyberpunk Japanese mask archive website inspired by a dystopian Tokyo surveillance system. Use a near-black navy background (#14171F), vivid warning red (#FF1919), warm paper cream (#EBE8E0), and occasional cyan glitch artifacts. The interface should feel like a classified digital terminal mixed with a museum archive.

Design a full-screen experience with an initial photosensitive warning modal offering Safe Mode and Enable Glitch Effect. Add a cinematic preloader with video/texture placeholder background, repeated [LOADING] labels, scrambled letters spelling UTOPIA TOKYO, and an [ENTER WEBSITE] command button.

The homepage hero should include a thin-line HUD grid, Tokyo coordinates, version labels, oversized fragmented typography, red angular clipped frames, Japanese cultural references, and a dark futuristic city/mask atmosphere. Use square corners, thin borders, frame-corner decorations, no rounded cards, no soft SaaS styling.

Build a mask explorer section with Grid, List, and Modal views. Each mask item should show an image placeholder, English name, Japanese eyebrow label, hover/selected/inactive states, and a detail panel with description plus stat bars for Strength, Intellect, Agility, Spirit, Vitality, and Ferocity. Hover states should dim inactive masks and animate the active mask with red outlines and subtle glitch.

Motion direction: use scroll-triggered reveal, smooth scrolling, scramble text reveal, SVG-like line drawing, glitch bursts, scanline/noise overlays, parallax texture layers, marquee mask strips, and FLIP-like transitions between grid/list/modal states. Include reduced-motion fallback and safe mode that disables rapid glitch effects.

Typography: combine a refined grotesque/sans display font for main headings, a pixel monospace font for metadata, and a compact UI font for labels. Use uppercase, bracketed command labels, version numbers, coordinates, system hashes, and Japanese kana/kanji as secondary markers.

Overall UX should feel like entering a restricted archive: warning -> system boot -> cinematic hero -> mask database -> personality generator -> footer wall of masks.
```
