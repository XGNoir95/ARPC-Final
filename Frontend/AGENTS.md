# Frontend conventions

- Use Tailwind CSS v4 utilities for all component styling. Preserve the current design, typography, colors, spacing, breakpoints and interaction timing unless the user requests a visual change.
- Keep complete utility strings in JSX or adjacent `*.styles.js` modules for complex components. Do not construct Tailwind class names by interpolating fragments.
- Keep style modules as framework-independent constants/functions so production verification can import them. Use `String.raw` when an arbitrary selector needs escaped underscores; double-escaping a normal JavaScript string can hide the runtime utility from Tailwind's scanner.
- Do not add component CSS, Sass, Less, CSS modules or CSS-in-JS stylesheets. `src/index.css` is the sole CSS entry point, reserved for the Tailwind import, font faces, theme tokens, keyframes and document defaults expressed with `@apply`.
- Inline `style` objects may only provide `--custom-properties` for runtime data, images or measured geometry. Apply those values through Tailwind utilities. Framer Motion and the Web Animations API may animate measured values directly.
- Keep semantic hook classes when interaction code or tests depend on them; their visual styles must come from Tailwind utilities.
- Preserve keyboard access, visible focus, responsive layouts and reduced-motion behavior during refactors.
- Run `npm run lint`, `npm test`, `npm run build` and `npm run verify:build` for styling refactors. The lint command includes a Tailwind policy check that also runs in CI.
