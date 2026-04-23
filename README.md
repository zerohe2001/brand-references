# brand-references

Personal visual reference library — a collection of deep-dive HTML pages that visualize well-known products' design systems (color palettes, typography, component styles, spacing, motion tokens, etc.). Built to inform design decisions in other projects: open the right brand, read how they think, copy what applies.

## Live pages

- [**Notion**](./notion.html) — Warm neutrals, ultra-thin borders, multi-layer shadows with sub-0.05 opacity. Paper, not glass.

More brands planned (Linear, Stripe, Apple, Vercel, Airbnb, Figma, Spotify, Superhuman, Tesla…).

## Structure

```
brand-references/
├── notion.html         ← Per-brand deep-dive reference page
└── _shared/
    ├── board.css       ← Cross-brand platform layer (a11y, scroll-spy, copy UX)
    └── board.js        ← Shared interaction (IntersectionObserver, clipboard, toast)
```

Each brand page references the shared CSS + JS and overrides its own `:root` tokens. See the CSS variable contract at the top of `_shared/board.css`.

## What a brand page covers

Six grouped sections:

- **Foundation** — Overview, Visual Theme, Key Characteristics
- **Color & Type** — Color Palette, Typography, Type Principles
- **Components** — Buttons, Cards, Inputs, Navigation, Distinctive Patterns, Image Treatment
- **Layout System** — Spacing, Radius, Depth & Elevation, Decorative Depth
- **Quality** — Responsive, States, Accessibility
- **Meta & Tooling** — Agent Prompts, Iteration Guide, Token Naming, Semantic Families, Motion Tokens, Component Spec Template

Every color swatch is click-to-copy; every code block has a Copy button; TOC has scroll-spy; supplement sections are marked with a `✦` glyph and a `template-scope-note` that flags what's brand-specific vs. reusable.

## How to add a new brand

1. `cp notion.html <brand>.html`
2. Override the `:root` CSS variables with the brand's palette (see token contract in `_shared/board.css`)
3. Rewrite per-section content — every supplement section has a `template-scope-note` telling you what's reusable skeleton vs. brand-specific content

## Accessibility

Target: WCAG 2.1 AA. Skip link, semantic headings, `aria-labelledby` on sections, `aria-current` on TOC, `:focus-visible` rings, `prefers-reduced-motion` support.

## Attribution

The Notion-inspired spec content derives from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT), which introduced the DESIGN.md format inspired by Google Stitch. This repo extends their minimal preview.html into a fuller deep-dive format and adds the cross-brand shared chrome layer.

## License

MIT
