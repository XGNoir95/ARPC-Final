# Administrator action rules

Account approval and email ownership are independent checks. The superadmin may approve a pending request while its address is unverified. The admin API and workspace still require `status: active` **and** `emailVerified: true`; approval never changes the verification flag. Until verification is complete, the workspace shows the remaining verification step and offers a new verification email.

## Account actions

| Current status | Available action | Next status |
| --- | --- | --- |
| Pending | Approve | Active; dashboard stays locked if email is unverified |
| Pending | Reject | Rejected |
| Active | Suspend | Suspended; existing sessions revoked |
| Suspended | Restore access | Active; a new sign-in is required |
| Rejected | Reopen review | Pending; a new approval is required |
| Any administrator except a superadmin | Delete account, after confirmation | Account removed; the email can register again |
| Superadmin | Protected | No status change from this page |

The account card displays Approved for an approved but unverified address and Active when both requirements are complete. It never shows another Approve action for an active account. Disabled controls are reserved for an operation already in progress; unavailable status changes are omitted.

The current workspace submits the previously displayed status and `accessRevision`. The API compares these values and atomically updates the matching status/revision. Stale decisions return a conflict. Repeated identical requests return the unchanged account without another revision, audit entry or email. A real transition records a new revision and uses `admin:<account id>:access:<revision>` as its mail event key. Notification reconciliation recovers an interrupted enqueue. Old records without these fields are treated as revision 1 without notifying existing users.

Deletion is limited to the superadmin and requires confirmation in the interface. The API checks the displayed status/revision before removing the user record. Its sessions and account verification/reset links are removed, old invitations are invalidated, and queued/failed account emails are cancelled. A new signup with the same email creates a different account that must complete verification and approval again. Club content, membership/enrollment applications and historical audit records are retained. The deletion itself is audited. The mail worker also checks that an access-notification recipient account still exists before sending; messages already handed to SMTP cannot be recalled.

## Related actions checked

- **Application review:** An unchanged status, payment review and trimmed note do not create another write. Notes/payment edits remain available without repeating the approval email. Membership approval requires verified payment. A supplied stale revision is rejected. A repeated course approval does not issue another learning link.
- **Content and lessons:** A current, unchanged draft cannot be saved or published again from the interface. The API also returns an unchanged record for identical saves/publications/withdrawals. Real draft changes can be published, and stale revisions are rejected before a write.
- **Invitations:** Existing accounts cannot receive an unusable new-account invitation. A current invitation is identified so administrators can use the existing email. Expired invitations permit a new request. Known conflicts have authored user-facing guidance instead of database details.
- **Mail retry:** Only failed deliveries are requeued. Sent, queued and currently processing messages are untouched. The response and workspace notice report the actual number retried, including zero.
- **Overlapping operations:** Workspace operations and account decisions guard against overlapping clicks while a request is running.

The changes update workflow code only; they do not approve or alter existing real accounts automatically. All regression tests use fictional records in disposable databases, with mocked or offline mail delivery.
