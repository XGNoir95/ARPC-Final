// Only deliberate, user-facing copy crosses the API boundary. Server details stay out of the UI.
export function requestMessage({ path = '', status = 0, kind = '', code = '', retryAfterSeconds = 0, serverMessage = '' } = {}) {
  if (kind === 'offline') return 'You appear to be offline. Check your internet connection and try again.';
  if (kind === 'network' || kind === 'response') return 'We couldn’t connect right now. Please try again in a moment.';
  if (status === 429) {
    const count = Math.ceil(retryAfterSeconds < 60 ? retryAfterSeconds : retryAfterSeconds / 60);
    const unit = retryAfterSeconds < 60 ? 'second' : 'minute';
    const wait = retryAfterSeconds > 0 ? ` Try again in ${count} ${unit}${count === 1 ? '' : 's'}.` : ' Please wait a moment and try again.';
    return `Too many attempts.${wait}`;
  }
  if (status >= 500) return 'Something went wrong on our side. Please try again in a moment.';
  if (path === '/auth/login' && status === 401) return 'Email or password is incorrect.';
  if (path === '/auth/verify-code' && [400, 404, 410, 422].includes(status)) return 'This code is incorrect or has expired. Check the latest email or request a new code.';
  if (/\/auth\/(?:verify|reset-password)$/.test(path) && [400, 401, 404, 410].includes(status)) return 'This link has expired or has already been used. Please request a new one.';
  if (path === '/learning/signin' && [400, 401, 404, 410].includes(status)) return 'This learning access link has expired or has already been used. Request a new link below.';
  if (status === 401) return path.startsWith('/learning') ? 'Your learning session has ended. Request a new access link to continue.' : 'Your session has ended. Please sign in again.';
  if (status === 403) {
    if (/auth\/login|auth\/google/.test(path)) return 'This account cannot sign in right now. Please contact the club for help.';
    if (path.startsWith('/admin')) return 'You don’t have permission to do this. Contact the club administrator if you need access.';
    return 'This action isn’t available for your account. Please contact the club if you need help.';
  }
  if (status === 404 || status === 410) return path === '/applications' ? 'This programme is no longer accepting enrollments. Please choose another programme from the catalogue.' : 'This item is no longer available. Please return to the previous page and choose another.';
  if (status === 409) {
    if (path.startsWith('/admin/files/') && code === 'FILE_IN_USE') return 'This file is used in a saved draft or published content. Remove it from that content before deleting the file.';
    if (code === 'FEATURED_UNAVAILABLE') return 'A selected programme is no longer published. Edit Featured and update the selection.';
    if (path === '/admin/invitations' && code === 'ACCOUNT_EXISTS') return 'An account already uses this email. Open Admin access to manage it.';
    if (path === '/admin/invitations' && code === 'INVITATION_PENDING') return 'This person already has a valid invitation. Use the existing invitation email.';
    if (path.startsWith('/admin/users/') && code === 'ACCOUNT_CHANGED') return 'This account changed while you were reviewing it. Refresh the page to see its current access.';
    if (path.startsWith('/admin/users/') && code === 'INVALID_ACCOUNT_ACTION') return 'This action is no longer available for this account. Refresh the page and choose an available action.';
    if (path === '/auth/register') return 'An account already uses this email. Sign in or reset your password.';
    if (path === '/auth/google') return 'Sign in with your existing password, then connect Google from your account settings.';
    if (path === '/applications') return 'An application with these details already exists. Check your confirmation email or contact the club.';
    return 'This item has changed or already exists. Refresh the page before trying again.';
  }
  if (status === 413) return 'This file is too large. Choose a file smaller than 10 MB.';
  if (status === 400 || status === 422) {
    if (/\/admin\/files/.test(path)) return 'Choose a supported image or document smaller than 10 MB, then try again.';
    if (path.includes('/auth/google')) return 'We couldn’t complete Google sign-in. Please try again.';
    // Keep useful, deliberately written guidance, never schema paths or validation dumps.
    const safeMessages = new Set(['Your passwords do not match.', 'Enter your full name.']);
    if (safeMessages.has(serverMessage)) return serverMessage;
    return 'Some details need attention. Check the information you entered and try again.';
  }
  return 'We couldn’t complete that request. Please try again.';
}

export function userMessage(error, fallback = 'We couldn’t complete that request. Please try again.') {
  return error?.userFacing ? error.message : error?.status ? requestMessage({status:error.status,retryAfterSeconds:error.retryAfterSeconds}) : fallback;
}
