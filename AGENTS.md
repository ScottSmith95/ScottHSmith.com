# AGENTS.md

This is a simple personal static website. The portfolio section pulls portfolio posts from a Ghost blog instance via the @tryghost/content-api.

## Project Information
- Role: personal site + portfolio.
- Data: portfolio content from Ghost Content API.
- Templates: Mustache and Nunjucks.
- Build: Eleventy extensions compile CSS/JS, write sourcemaps, generate/optimize SVG sprite, process local portfolio images.

## Setup commands
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Build website: `npm run build`

## Prerequisites
- Node.js matches `package.json` engines.
- `.env` must define `GHOST_CONTENT_API_URL` and `GHOST_CONTENT_API_KEY`.
- Ghost config is created at Eleventy config load time, so missing values fail startup before templates render.

## Priority order for decisions
1. Preserve working behavior.
2. Preserve current architecture and tooling.
3. Preserve existing visual and content tone.
4. Minimize diff size.
5. Prefer consistency with `ScottHSmith.com` patterns.

## Shared platform assumptions
- Node.js ESM is standard (`"type": "module"`).
- Deployment target is usually Vercel.
- Static sites using Eleventy.
- CSS is compiled through PostCSS.
- Front-end behavior is vanilla JS, no framework runtime.

## Required workflow for agents
1. Inspect touched files first.
2. Change source files only, never generated output.
3. Keep changes local and targeted.
4. Run relevant checks.
5. Report what changed, why, and any remaining risks.

## Source of truth and generated files
- Source templates are `.mustache` and `.njk` files in the project root, `miscellanea/`, `portfolio/`, and `_includes/`.
- Edit source templates, not adjacent `.html` files that may exist as older generated snapshots.
- Do not edit `_site/`, `assets/**/build/`, or sourcemaps directly.

## Formatting and code style
- Use tabs for indentation.
- Use LF newlines.
- Keep semicolons in JS.
- Prefer single quotes in app/source JS where that style already exists.
- Use lowercase kebab-case file names.
- Keep imports ordered by node/third-party/local groups.
- Keep comments short and only when logic is non-obvious.

## Template and markup conventions
- Reuse existing components/partials before making new ones.
- Keep `html.no-js` and the `global-script` class swap pattern intact.
- Preserve semantic landmarks (`header`, `main`, `nav`, `footer`).
- Preserve accessibility affordances already in place (screen-reader-only labels, `aria-expanded`, `aria-controls`, `aria-live`, keyboard-accessible toggles).

## Portfolio data workflow
- Portfolio pages/posts are fetched from Ghost Content API and compiled into Eleventy collections.
- `collections.posts` includes Ghost posts and pages, then `portfolio/postTemplate.njk` paginates from that collection.
- `collections.bin` auto-renders non-featured posts in `_includes/portfolio/bin.njk`.
- Featured work requires both a Ghost post with `featured: true` and a matching include in `portfolio/index.njk` (for manual homepage ordering/content).
- Portfolio URLs are normalized to `/portfolio/...`; keep that routing expectation intact.

## CSS conventions
- Keep design tokens centralized in `variables.css` or `_variables.css`.
- Preserve CSS Nesting style.
- Prefer mobile-first declarations with wider breakpoints layered on top.
- Preserve reduced-motion handling and feature fallbacks.
- Do not introduce an unrelated visual direction unless requested.

## JavaScript conventions
- Keep behavior framework-free and DOM-first.
- Prefer small explicit functions over abstraction-heavy rewrites.
- Prefer bleeding-edge progressive enhancement with fallback options.
- Prefer strict mode
- Prefer single quotes
- Keep user-facing copy consistent with the site's current voice.

## Build pipeline details
- Eleventy extensions compile CSS/JS directly from source files.
- CSS entrypoints skip files starting with `_` and files whose names include `variables`.
- JS entrypoints skip files whose names include `eleventy` or `service-worker`.
- `assets/scripts/social-icons.js` is bundled with Flickity during minification.
- SVG sprite is generated from `assets/images/social-icons/` into `_site/assets/images/social-icons/build/home-sprite.svg`.
- `eleventy-plugin-local-images` processes remote portfolio image `src` values into local assets.

## Validation expectations
- Always run `npm run build` after meaningful changes.
- Review build logs for `Error:` lines even if Eleventy reports successful writes.
- If remote image downloads fail during build, call it out in risks so failures are not mistaken for local template regressions.
