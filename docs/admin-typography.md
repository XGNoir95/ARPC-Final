# Admin typography and responsive layout

The admin workspace retains ARPC's green and gold palette, the existing dark theme, EB Garamond headings and sans-serif working text. Typography changes apply to the workspace, content libraries, applications, lesson editor, contextual file controls, account settings, access management and their dialogs.

## Type scale

| Role | Size | Treatment |
| --- | --- | --- |
| Page heading | 40px on phones, 48px from the small breakpoint | Garamond semibold, tight leading |
| Section and dialog heading | 28px on phones, 30px from the small breakpoint | Garamond semibold |
| Body, navigation, controls and form labels | 16px | Sans-serif, 24–28px leading |
| Supporting details, dates, chart axes and badges | 14px | Sans-serif, 20–24px leading |
| Sidebar logo | 56px on phones, 64px from the small breakpoint | Fixed square, no shrinking |
| Sidebar wordmark | 36px on phones, 40px from the small breakpoint | Garamond semibold |

The shared rules are in `Frontend/src/Components/Admin/AdminUI.styles.js`. The larger type replaces the former 12px supporting copy and 14px primary copy. Forms retain 16px inputs, and explanations stay within 65–70 characters per line. Colors and decorative treatments are retained rather than introducing a second visual identity.

## Layout

```text
Desktop:  [Brand + navigation] [Toolbar / page heading / flexible panels]
Phone:   [Brand + menu]       -> toolbar -> page heading -> stacked panels
```

The sidebar is 18rem on desktop and 20rem on wide screens. It becomes a collapsible menu below 1024px; Escape closes it and restores focus to the menu button. The logo and adjacent text scale together.

Cards, controls and dialogs allow wrapping within the available workspace width. Statistics stack on the narrowest phones. Library list rows use the library container's width to decide when to become horizontal. Fields and preview panels stack at smaller breakpoints, and dialogs scroll within the viewport. The persistent page controls float over the content; pages and loaders do not reserve bottom space for them.

Chart labels are HTML text beside a responsive SVG plot, so resizing the chart does not shrink its typography. Data points support hover, keyboard focus and touch selection. Admin loaders use the same shell dimensions as loaded pages.

## Local configuration

The root `.gitignore` excludes real environment files, dependencies, generated builds, caches, test artifacts, logs, private key files and local database/uploads. The safe references are `Frontend/.env.example` and `Backend/.env.example`; their credential fields are blank. No real environment file is changed by this update.
