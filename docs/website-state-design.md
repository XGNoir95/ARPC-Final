# ARPC website state and recovery design

Status: Implemented in the frontend

This design covers the public website, account access, participant forms, learning area and admin workspace. A missing collection, a failed request and an account restriction must produce different messages and recovery actions. The website must not reveal API configuration, validation schemas, database messages, secrets or stack traces.

The structure follows the Abstract, Goals, Background, Architecture, Request Lifecycle, Contracts, Consistency, Security, Operational Readiness and Alternatives sections of the supplied System Design reference. The retained Word template is unchanged. This is an implementation note for the requested website work, rather than a new Word document.

## Abstract

Shared state components now present clear titles, short explanations and relevant actions using ARPC's green, gold and Garamond typography. The successful content layouts continue to work as before. Failed requests retain usable content when it exists; a failed mutation does not clear the user's form.

## Goals

- Always explain why a primary content area has no usable content.
- Distinguish loading, a genuine empty collection, filtered results, failed reads, expired links, denied access and completed actions.
- Offer actions that change the situation. Do not offer “reset filters” when no records exist.
- Keep internal diagnostics out of rendered user messages.
- Preserve existing authentication, approval, manual payments, draft publishing and enrollment behavior.

## Background

### Empty-state presentation

`StateView` uses a centered vertical stack: resource icon, heading, explanation and recovery actions. The surrounding public-page gutters stay unchanged. Admin, learning and public sections share the same presentation; compact states reduce vertical spacing without introducing a different type scale.

- Palette: surface `#ffffff`, field `#f6f8f5`, ink/action `#173d2e`, supporting copy `#426454`, gold `#e9ad5e`. Existing black and gray theme tokens supply the dark appearance.
- Type: EB Garamond semibold headings scale from 30 to 36 pixels with the container; supporting sans-serif copy uses 16 pixels with 28-pixel leading. Explanations stay within 54 characters per line.
- Alignment: icons, text and wrapping actions share the center axis. Form fields and account checklists retain left-aligned labels inside the centered content area.
- Wording: name the missing content, explain where it will appear and offer a relevant next step. No results and unavailable data remain distinct from an empty collection.
- Restraint: retain the existing border, pale surface and resource icons. No new decorative labels, background effects or automatic entrance animations.

```text
|                  [resource icon]                  |
|                No programmes yet.                 |
|       Short explanation and a useful next step.   |
|          [Primary action] [Secondary action]      |
```

The previous catalogue showed search advice for unpublished collections. The gallery kept swipe instructions without photos. The panel had no empty-state message. The workspace combined verification, approval and failed requests in one small card. Account recovery could display a heading without a useful message when a token was missing. Several pages rendered raw API errors.

## Proposed architecture

| Component | Responsibility | Failure behavior |
| --- | --- | --- |
| `utils/api.js` | Cookie-based API requests, cancellation and deadlines | Rejects with deliberate user-facing copy and typed status information; never automatically repeats writes |
| `utils/userMessages.js` | Context-sensitive message mapping | Unknown messages receive safe fallback copy; server validation dumps and internal details are not forwarded |
| `ContentProvider` | Published public content and explicit request state | Validates collection shapes, retains existing data on refresh failure and exposes an explicit retry action |
| `StateView` and `StatePage` | Section and full-page state presentation | Consistent readable headings, purposeful icons and valid recovery links or buttons |
| `Notice` | Inline errors, success messages and temporary warnings | Announces messages without replacing the user's work |
| `AccountStatus` | Verification, approval and account restrictions | Separates pending checks, approved access, suspended accounts and workspace failures |
| `PageErrorBoundary` | Unexpected render failures | Contains the failed page and offers retry or home navigation without displaying exception details |
| `SafeImage` | Failed or missing images | Provides an image placeholder; decorative heroes fall back to their existing background |
| `utils/download.js` | Protected learning and admin file downloads | Keeps missing files, expired sessions and failed downloads inside the website with safe feedback |

## Request lifecycle

1. The page starts with a loading state, not an empty-state claim.
2. A successful response is checked before data is rendered. Public collections must be arrays of objects.
3. A successful empty collection receives resource-specific copy. A filtered empty result offers a reset action.
4. A failed initial request offers retry and a useful route away. A failed refresh retains previously loaded content and shows a non-blocking update notice.
5. Requests have explicit deadlines: 20 seconds for ordinary requests, 60 seconds for uploads and protected downloads, 12 seconds for the public-content load and the existing 8-second session check.
6. Caller cancellation is preserved. Unmounted or superseded reads cannot overwrite the current page.
7. Failed form submissions keep entered values. The interface reports a completed admin write separately from a failed workspace refresh.

## API and data contracts

| Input | Presentation |
| --- | --- |
| Network unavailable or offline | Connection guidance and retry; no instructions to start servers or edit API URLs |
| Malformed JSON or unexpected content shape | A recoverable content error, not a fake empty collection |
| 400 or 422 | Concise form guidance; schema paths and raw validator text remain hidden |
| 401 during login | Incorrect email or password |
| Other 401 responses | Session or learning-access guidance appropriate to the endpoint |
| 403 | Account permission guidance; an unavailable admin action is not mistaken for pending approval |
| 404 or 410 | Missing item or expired link; an enrollment endpoint explains that enrollment is unavailable |
| 409 | Existing account, duplicate application or changed-record guidance appropriate to the operation |
| 413 | File-size guidance |
| 429 | A usable wait time when supplied by the server |
| 5xx | Temporary service failure and retry; no server exception text |

## Page coverage

| Area | Conditions and recovery |
| --- | --- |
| Home | Unavailable featured events, no featured events, stale-content notice; optional affiliations remain hidden when no affiliations are published |
| Catalogue | Initial load, failed load, stale data, completely unpublished catalogue, empty programme category and filtered empty results |
| Gallery | Loading, failed load, no photos, stale data, missing images and a removed viewer selection; swipe instructions appear only with multiple photos |
| Panel | Loading, failed load, no teams, no member profiles and missing portraits |
| Membership and enrollment | Field validation, retained values after failed submission, duplicates and successful receipt; enrollment also handles missing or closed programmes |
| Login and registration | Failed authentication, duplicate registration, rate limits and unavailable Google sign-in with useful retry guidance |
| Email verification | Six-digit code entry; expiry, resend cooldown and attempt-lock countdowns from server time; failed delivery recovery; missing, expired and single-use legacy links; successful verification retains the club approval requirement |
| Password recovery | Missing or expired reset links, mismatched passwords, unsuccessful requests and privacy-preserving email confirmation |
| Learning | Loading, absent or expired access, failed course reads, no approved courses, no lessons and failed progress updates |
| Admin workspace | Initial connection, failed workspace read, missing page, pending verification, pending approval, rejected or suspended accounts and failed mutations |
| Admin content and media | No drafts, filtered results, unavailable previews, invalid uploads, missing courses, failed curricula and empty or unavailable signed-in devices |
| Analytics | No activity in a selected period, no page views and no programme-library entries |
| Profile | An honest unavailable-member-profile state; administrators are directed to their real account page instead of sample personal records |
| Unknown routes and unexpected render errors | Branded recovery pages with a working route to the home page or workspace |

## Consistency and replay

Public refreshes can use the content already loaded in this tab. New content replaces it only after a successful response. Account operations, submissions, uploads and publishing are never retried automatically. The existing backend remains the authority for sessions, approvals, publication revisions and duplicate applications. The frontend does not claim exactly-once delivery after a network timeout.

## Security and privacy

The API adapter deliberately maps error statuses to approved copy instead of forwarding arbitrary server messages. User data remains protected by the existing cookie/session and backend permission checks. No credentials, environment files, persistent database records or deployment settings are changed by this work. Password recovery confirmations do not reveal whether an email has an account.

## Operational readiness

Automated checks cover empty versus failed collections, retry recovery, stale-data retention, account states, expired links, safe error messages, image failures and unexpected render errors, alongside the existing authentication and content tests. Frontend lint, the complete test suite, the production build and production-artifact verification are required before completion.

Browser-based visual verification is unavailable in the current session because the UI tool exposes no browsers. Runtime connection outages, real Google consent and live email delivery are not exercised by mocked frontend tests.

## Alternatives considered

Raw server error banners were rejected because they reveal details and can obscure the public hero. A single “nothing found” message was rejected because it misrepresents loading and request failures. Automatically retrying failed writes was rejected because their outcome may be unknown and repeating them can create duplicates.

## References

- [GOV.UK service error pages](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/) — plain language, recovery actions and accurate treatment of previously entered information.
- [Nielsen Norman Group empty-state guidance](https://www.nngroup.com/articles/empty-state-interface-design/) — distinguish state and guide the next useful action.
- [USWDS alerts](https://designsystem.digital.gov/components/alert/) — accessible inline status, warning and error communication.
