# Contributing

Thanks for helping improve this portfolio site. This project is a Vue 3, Vite, Vuetify, Tailwind CSS, and YAML-backed static frontend, so most contributions should stay small, focused, and easy to review.

## Getting Started

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

Build the production output:

```sh
npm run build
```

Preview a production build:

```sh
npm run preview
```

Run linting:

```sh
npm run lint
```

## Project Workflow

1. Create a branch for your change.
2. Keep the change focused on one feature, fix, or content update.
3. Follow the existing component, styling, and content patterns.
4. Run `npm run lint` and `npm run build` before opening a pull request.
5. Include a short summary of what changed and any screenshots for visual UI updates.

## Content Updates

Most portfolio data lives under `src/content/` and is imported into Vue views and components. When editing content:

- Keep YAML formatting valid and consistent with nearby entries.
- Prefer existing field names and structures.
- Check affected pages locally with `npm run dev`.
- If gallery images change, run:

```sh
npm run sync:gallery-manifest
```

The production build also runs the gallery manifest sync automatically through `prebuild`.

## Code Style

- Use Vue single-file components for UI work.
- Keep components scoped to their feature area when possible.
- Prefer existing Vuetify, Tailwind, router, and helper patterns.
- Use clear names for props, computed values, and helper functions.
- Avoid unrelated refactors in the same change.
- Do not commit generated `dist/` output unless a maintainer specifically asks for it.

## UI Changes

For visual changes:

- Test both desktop and mobile widths.
- Make sure text does not overlap or overflow its containers.
- Keep spacing, colors, icons, and card styles consistent with the surrounding page.
- Add screenshots or screen recordings to the pull request when the change is visible.

## Pull Request Checklist

Before submitting, confirm:

- `npm run lint` passes.
- `npm run build` passes.
- The affected route or component was checked locally.
- Content links, document links, and external links still work.
- The pull request description explains the user-facing impact.

## Deployment

The app builds to `dist/`. Existing deployment paths include GitHub Pages through:

```sh
npm run deploy
```

Deployment should usually be handled by maintainers.
