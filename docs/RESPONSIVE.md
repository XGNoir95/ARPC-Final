# Responsive layout checks

The existing forest, sage and gold palette, typography and interactions are retained. Responsive styling uses Tailwind utilities; there are no component stylesheets.

- Navigation uses a fluid wordmark width. Phones below 768px use a compact menu with a gold current-page indicator. Photo heroes use a neutral translucent menu and an outlined membership action; other routes retain the forest panel and sage action. Medium widths retain horizontal links with a larger wordmark and smaller link text. The menu scrolls within short windows and closes on Escape, outside taps, navigation or a switch to desktop width.
- Membership and enrollment forms stack their columns before fields become cramped. Payment views share a grid area, with enough space for narrow-screen controls and natural growth for enlarged text.
- Member profiles and course details respond to their own container width. Long names, departments and email addresses wrap instead of overflowing. Profiles can grow beyond the roster height when necessary.
- Webinar captions fit small phones. Course metadata uses fewer columns in narrow detail windows; laptop sidebars remain readable around tablet and laptop breakpoints.
- Account pages scroll naturally and use 16px input text. Profile avatars and actions fit small screens. Skeletons follow the same responsive form layouts.

## Verification

Chromium viewport checks covered widths of 320, 360, 390, 414, 640, 768, 820, 1024, 1280, 1366, 1920, 2560 and 3840 pixels, plus a 740 × 360 landscape window. Routes checked: Home, Panel, Catalogue, Join Us, event/webinar/course enrollment, sign-in, registration and profile.

Expanded books, webinar files, courses, member profiles, payment details and profile tabs were also checked. The event shelf intentionally scrolls horizontally within its own enclosure; the page itself should not scroll horizontally.

Before changing responsive styling, repeat these checks at the narrowest supported width and immediately on both sides of affected breakpoints:

1. Check page overflow and clipped text, including long titles and profile values.
2. Open each interactive panel and switch between entries.
3. Check form validation, review and edit states.
4. Open the mobile menu in a short landscape viewport and verify all links remain reachable.
5. Check loading silhouettes, keyboard focus and reduced motion.

Run `npm run lint`, `npm test`, `npm run build` and `npm run verify:build` in `Frontend`. Physical-device and Safari/Firefox checks remain useful before release; the viewport audit does not simulate every browser engine.
