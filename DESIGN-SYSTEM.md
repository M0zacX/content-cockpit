# Zain's Content Planner — Design System

## Philosophy
Frosted glass (glassmorphism) inspired by Windows 11 Mica/Acrylic materials. Futuristic, layered depth with translucent surfaces over animated gradient backgrounds. Dark mode is the hero — super dark gray with glowing accents.

---

## Color Tokens

### Light Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--color-page-bg` | `#f0f2f7` | Page background base |
| `--color-surface` | `rgba(255,255,255,0.65)` | Primary glass fill |
| `--color-surface-solid` | `#ffffff` | Non-glass fallback |
| `--color-foreground` | `#1a1a2e` | Primary text |
| `--color-text-secondary` | `#64748b` | Muted text |
| `--color-text-tertiary` | `#94a3b8` | Hint/placeholder text |
| `--color-accent` | `#6366f1` | Indigo primary accent |
| `--color-accent-hover` | `#4f46e5` | Accent hover state |
| `--color-accent-glow` | `rgba(99,102,241,0.25)` | Accent glow/ring |
| `--color-border` | `rgba(148,163,184,0.25)` | Subtle borders |
| `--color-input-bg` | `rgba(241,245,249,0.60)` | Input field bg |
| `--color-hover-row` | `rgba(99,102,241,0.06)` | Table row hover |

### Dark Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--color-page-bg` | `#0b0b14` | Super dark indigo-black |
| `--color-surface` | `rgba(22,22,38,0.70)` | Dark glass fill |
| `--color-surface-solid` | `#12121f` | Non-glass fallback |
| `--color-foreground` | `#e8e8f0` | Primary text |
| `--color-text-secondary` | `#8b8fa8` | Muted text |
| `--color-text-tertiary` | `#5c5f78` | Hint text |
| `--color-accent` | `#818cf8` | Brighter indigo for dark bg |
| `--color-accent-hover` | `#6366f1` | Accent hover |
| `--color-accent-glow` | `rgba(129,140,248,0.20)` | Accent glow |
| `--color-border` | `rgba(255,255,255,0.07)` | Subtle borders |
| `--color-input-bg` | `rgba(255,255,255,0.05)` | Input field bg |
| `--color-hover-row` | `rgba(129,140,248,0.08)` | Row hover |

### Semantic Colors (auto-adapt per mode)
| Name | Light | Dark |
|------|-------|------|
| rose | `#f43f5e` | `#fb7185` |
| green | `#22c55e` | `#4ade80` |
| blue | `#3b82f6` | `#60a5fa` |
| amber | `#f59e0b` | `#fbbf24` |
| purple | `#a855f7` | `#c084fc` |
| orange | `#f97316` | `#fb923c` |

---

## Glass Levels

### Subtle (row hovers, minor elements)
```css
background: rgba(255,255,255, 0.35);  /* dark: 0.04 */
backdrop-filter: blur(8px) saturate(120%);
border: 1px solid rgba(255,255,255, 0.45);  /* dark: 0.08 */
```

### Medium (toolbar, dropdowns, cards)
```css
background: rgba(255,255,255, 0.55);  /* dark: 0.07 */
backdrop-filter: blur(16px) saturate(150%);
border: 1px solid rgba(255,255,255, 0.60);  /* dark: 0.14 */
box-shadow: 0 8px 32px rgba(31,38,135, 0.08);  /* dark: rgba(0,0,0,0.35) */
```

### Strong (main containers, modals)
```css
background: rgba(255,255,255, 0.72);  /* dark: 0.10 */
backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(255,255,255, 0.60);  /* dark: 0.14 */
box-shadow: 0 16px 48px rgba(31,38,135, 0.12);  /* dark: rgba(0,0,0,0.45) */
```

---

## Background System

### Mesh Gradient
4 radial gradients over the page base color, `background-attachment: fixed`:
- Top-left: blue tint
- Top-right: indigo tint
- Bottom-center: purple tint
- Bottom-right: green tint

### Noise Texture
Inline SVG fractal noise at 2.5% opacity (light) / 4% opacity (dark).

### Floating Orbs
3 blurred circles (400/350/300px) with 20s float animation:
- Indigo orb — top-left
- Purple orb — bottom-right
- Blue orb — bottom-center

---

## Component Mapping

| Component | Glass Level |
|-----------|------------|
| Toolbar | Medium |
| Table container | Strong |
| Table header | Transparent (inherits) |
| Table row hover | Subtle |
| Dropdowns | Medium |
| Script editor | Solid surface (full-screen) |
| Script editor top/bottom bars | Medium |
| Toast notifications | Medium + accent glow |
| Modal backdrop | Black/40 + blur |
| Buttons (primary) | Accent color |
| Buttons (secondary) | Subtle glass |
| Pills/badges | 10% opacity semantic color |
| Input fields | Input bg token |

---

## Typography
- **Font**: Geist Sans (body) / Geist Mono (code/scripts)
- **Primary text**: `var(--color-foreground)`
- **Secondary**: `var(--color-text-secondary)`
- **Tertiary**: `var(--color-text-tertiary)`

---

## Dark Mode Toggle
- `localStorage` key: `zain_planner_theme`
- Falls back to `prefers-color-scheme`
- Applied via `.dark` class on `<html>`
- FOUC prevention via inline `<script>` in `<head>`
