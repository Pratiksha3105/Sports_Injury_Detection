// Access tokens live in memory only (never localStorage/sessionStorage) so
// they can't be lifted by an XSS payload reading browser storage. The
// refresh token lives in an httpOnly cookie the JS layer never touches.
let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Registered once by AuthProvider; called when a silent refresh fails. */
export function registerSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

export function notifySessionExpired(): void {
  accessToken = null;
  onSessionExpired?.();
}
