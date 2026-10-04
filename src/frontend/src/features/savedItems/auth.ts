// Stub auth, standing in for a real identity provider: the API reads the
// signed-in user from X-User-Id and answers 401 without it. Every saved-items
// request goes through authHeaders(), so replacing this one constant with the
// real session user is the only change needed when auth lands.
export const CURRENT_USER_ID = "dev-user";

export function authHeaders(): Record<string, string> {
  return { "X-User-Id": CURRENT_USER_ID };
}
