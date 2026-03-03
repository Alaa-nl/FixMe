# FixMe Project - Claude Development Guide

## Project Overview
FixMe is a Next.js application for issue tracking and project management.

## Frontend Aesthetics Guidelines

<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

### Typography
Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.

**Never use:** Inter, Roboto, Open Sans, Lato, default system fonts

**Impact choices:**
- Code aesthetic: JetBrains Mono, Fira Code, Space Grotesk
- Editorial: Playfair Display, Crimson Pro, Fraunces
- Startup: Clash Display, Satoshi, Cabinet Grotesk
- Technical: IBM Plex family, Source Sans 3
- Distinctive: Bricolage Grotesque, Obviously, Newsreader

**Pairing principle:** High contrast = interesting. Display + monospace, serif + geometric sans, variable font across weights.

**Use extremes:** 100/200 weight vs 800/900, not 400 vs 600. Size jumps of 3x+, not 1.5x.

### Color & Theme
Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

### Motion
Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

### Backgrounds
Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

### Avoid Generic AI-Generated Aesthetics
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>

## Isolated Prompting Guidelines

### Typography-Only Prompt
<use_interesting_fonts>
Typography instantly signals quality. Avoid using boring, generic fonts.

**Never use:** Inter, Roboto, Open Sans, Lato, default system fonts

**Impact choices:**
- Code aesthetic: JetBrains Mono, Fira Code, Space Grotesk
- Editorial: Playfair Display, Crimson Pro, Fraunces
- Startup: Clash Display, Satoshi, Cabinet Grotesk
- Technical: IBM Plex family, Source Sans 3
- Distinctive: Bricolage Grotesque, Obviously, Newsreader

**Pairing principle:** High contrast = interesting. Display + monospace, serif + geometric sans, variable font across weights.

**Use extremes:** 100/200 weight vs 800/900, not 400 vs 600. Size jumps of 3x+, not 1.5x.

Pick one distinctive font, use it decisively. Load from Google Fonts. State your choice before coding.
</use_interesting_fonts>

### Motion Guidelines
<animation_principles>
- Use CSS-only animations wherever possible
- For React components, prefer Framer Motion library
- Focus on high-impact moments: page loads with staggered reveals
- Use animation-delay for orchestrated sequences
- Prioritize micro-interactions that feel natural and responsive
- Avoid over-animating - less is more when done right
</animation_principles>

### Color System
<color_guidelines>
- Use CSS variables (Tailwind's custom color system works well)
- Commit to a dominant color with sharp accent colors
- Avoid evenly-distributed palettes
- Draw inspiration from:
  - IDE themes (VS Code themes, Sublime themes)
  - Cultural aesthetics
  - Nature-inspired palettes
  - Bold, confident color choices
</color_guidelines>

## Tech Stack Context
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Database:** Prisma ORM
- **TypeScript:** Strict mode enabled
- **Animation:** Framer Motion (when needed)

## Development Principles
1. Always choose distinctive, memorable design choices
2. Avoid generic patterns that make the app look like every other SaaS tool
3. Use typography as a primary differentiator
4. Create cohesive color systems with CSS variables
5. Add motion thoughtfully - high-impact moments over scattered micro-interactions
6. Layer backgrounds for depth and atmosphere
7. Think outside the box - vary your choices across different pages/components
