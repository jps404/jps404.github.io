# Jed Solomon - Personal Portfolio

Personal, professional portfolio created for an AI tools course at Tulane University.

- Website: https://jps404.github.io/
- Repository: https://github.com/jps404/jps404.github.io

## Purpose and content

The homepage presents education, professional experience, an original portrait, and a LinkedIn contact link. A separate Interests page contains selected readings and music. The readings are external sources, not work authored by Jed. The linked amicus brief is provided as context for research experience, not as a claim of sole authorship.

## AI-assisted development

The site began with Claude and was subsequently revised with OpenAI Codex. AI assistance covered implementation, iterative design and copy changes, research suggestions, and publishing configuration. Jed directed the revisions and selected the content.

This repository is a clean migration of the current site from an earlier private project. It deliberately excludes old book PDFs, artwork downloads, private planning material, and the earlier project's Git history. The first commit here is the migration baseline, not the beginning of development.

## Design and accessibility

The design uses a restrained monochrome palette, consistent spacing, responsive layouts, and a small original photograph. The implementation includes semantic headings, a skip link, visible keyboard focus, keyboard-operated tabs, reduced-motion support, and descriptive links.

These are implementation choices, not a claim that every browser, device, or assistive technology has been tested. YouTube and WWOZ are third-party services; playback may depend on browser settings and provider availability. External reading sources may require subscriptions. Reading links are provided instead of redistributing full texts.

## Run locally

Use Node.js 24 or later:

```sh
npm ci
npm run dev
```

Open the localhost address printed by Astro. Use `localhost`, not a numeric IP address, for YouTube embeds.

```sh
npm run build
npm run preview
```

## How the site works

- `src/pages/`: the homepage and Interests route.
- `src/components/ElitePortfolio.astro`: profile, experience, and education.
- `src/components/Interests.astro`: reading links and music selections.
- `src/styles/elite-final.css`: typography and responsive layout.
- `src/scripts/elite-interactions.ts`: interest tabs, video controls, and radio playback.
- `src/layouts/Portfolio.astro`: shared document metadata.

Astro creates static HTML. JavaScript adds interactive controls on the Interests page. No database or application server is required.

## Publishing

GitHub Pages is configured to use GitHub Actions. Pushing to `main` builds and deploys the same public site for both grading rounds. The domain is the standard GitHub Pages URL; there is no custom-domain mapping.

## Attribution

The locally hosted text font is a subset of Brygada 1918, distributed under the SIL Open Font License. See `public/fonts/OFL.txt`. The portrait is Jed's original LinkedIn photograph. Linked articles, videos, and radio programming remain the work of their respective creators.
