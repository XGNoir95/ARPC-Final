# ARPC service emails

All existing outgoing email workflows share the club's visual identity: the actual ARPC emblem, deep green `#0e291e`, forest green `#173d2e`, gold `#e9ad5e`, white content and a soft sage `#eef4ef` background. Georgia/Times headings provide a broadly available serif counterpart to the website's Garamond; Arial/Helvetica body text stays readable at 16px with 26px line height.

The 600px email frame contains the club masthead, a purpose-specific heading, greeting, short explanation, relevant details, an action when needed, the ARPC team's sign-off and a consistent club footer. Token emails explain expiry and safe handling and include a copyable link beneath the button. Mobile styles reduce outer padding without shrinking body copy. Layout tables and inline styles carry the essential presentation if a client ignores the responsive stylesheet. Actual inbox rendering can still vary by mail client.

## Covered workflows

| Email | Recipient information |
| --- | --- |
| Account verification and resend | Copyable six-digit code, 10-minute expiry, latest-code and privacy guidance, approval requirement |
| Password reset | Private reset link, one-hour expiry, guidance for an unexpected request |
| Administrator invitation | Inviter, registration link, 72-hour expiry, verification and approval requirements |
| Administrator access update | Approved with verification complete, approved awaiting verification, suspended, not-approved and reopened-review explanations; dashboard action only when both checks are complete |
| Application receipt | Human-readable membership/event/webinar/course label, published programme title when available, reference and review status |
| Application decision | Pending, approved or not-approved copy appropriate to the application type |
| Course approval access | Private learning link, course title, one-hour expiry and new-link guidance |
| Requested learning access | Private return link with the same one-hour and single-use guidance |
| Older queued messages | Original plain-text body and a matching branded HTML frame |

Application receipts do not claim that payment has been verified. Participant emails exclude internal review notes, payment transaction details, phone numbers and student IDs. Draft programme titles are never included. No additional notification events have been introduced.

## Editing and previewing

- `Backend/src/emailTemplates.js`: shared palette, frame, message copy, HTML escaping, action URL checks and plain-text alternatives.
- `Backend/src/emailMessage.js`: sender display name, hosted emblem and delivery message construction.
- `Backend/src/assets/arpc-logo.jpg`: copy of the current public club emblem used by offline previews.
- `Backend/src/outbox.js`: stores HTML and text together, preserving event deduplication.

From `Backend`, run:

```powershell
npm run mail:preview
```

Open `Backend/.cache/mail-preview/index.html` for 22 fictional examples. Choose Desktop or Mobile to adjust the preview width, or Plain text to inspect the alternative. Generated files are ignored by Git. The command does not load credentials, read real queued mail or send messages. Preview action links use the reserved `.test` domain and do not sign anyone in.

## Email verification codes

Password registration creates a pending account and a session, then queues a six-digit cryptographically random code. The account status page accepts the code. Codes expire after 10 minutes and work once. The database stores a salted scrypt hash in a field excluded from normal account queries and API profiles. The restricted mail outbox necessarily contains the email body for delivery; it is never returned to the browser.

MongoDB enforces five guesses per account per 15 minutes across resends, a 60-second resend cooldown and five code emails per hour. Atomic attempt claims and challenge revisions prevent parallel guesses or old codes from bypassing those limits. The worker suppresses expired, replaced and deleted-account code jobs before sending. An email already handed to SMTP cannot be recalled; only the latest code is accepted.

If enqueueing fails after account creation, registration still succeeds and the account status page offers recovery. Existing verification links remain valid until their original expiry. Successful legacy verification or linking a verified Google identity clears outstanding codes. Google signup already supplies a verified email. Email verification never grants club approval.

The emblem is a normal hosted image in the HTML; no image MIME part, filename or attachment is sent. Both HTML and text are supplied as [message alternatives](https://nodemailer.com/message). This avoids the attachment chip that some clients show for [CID images](https://nodemailer.com/message/embedded-images). Existing queued CID messages are converted at send time, and queued branded HTML uses the current logo URL. Already delivered emails cannot be changed.

The built-in logo URL is the club's [public AUST emblem](https://www.aust.edu/storage/files/Te3EO82GEGAdm9ihZ8VGEg1WMi5VHSpjbEw5T0FD.jpg), so it loads independently of a localhost development website. Set `MAIL_LOGO_URL` only to override this with another publicly accessible HTTPS image URL, such as a CDN. The image must remain reachable without authentication; local/private addresses and non-HTTPS URLs are refused. Offline previews copy the actual emblem locally and need no image host. Some clients may ask recipients to allow external images; the ARPC wordmark and alternative text remain readable. Replies go to the configured sender address; the template does not invent a separate support mailbox.

## Delivery and checks

Existing SMTP configuration, bounded retries, worker leases, application reconciliation, notification event keys, token lifetimes and single-use enforcement remain in place. Existing queued messages are formatted at send time; already delivered messages are not resent. A configured `MAIL_FROM` display name is preserved; a bare `MAIL_FROM` or `SMTP_USER` receives the name `Ahsanullah Roh. Peace Club (ARPC)`.

Administrator decisions use a monotonic access revision and a deduplicated notification event. The worker reconciles committed decisions whose notification has not been queued, so an interrupted enqueue can recover without repeating an approval. Existing accounts without revision fields start at revision 1 and receive no unsolicited messages.

Run `npm run check` and `npm test` from `Backend`. Tests cover every template/status, HTML injection handling, permitted action destinations, hash routes, token instructions, application privacy, published programme names, durable HTML storage, legacy mail delivery, sender identity, MIME alternatives without image attachments, hosted emblem URLs, retries and existing account/application workflows. Tests use a disposable database, mocked SMTP and an offline MIME transport. Real inbox delivery is not part of automated verification.
