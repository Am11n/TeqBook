/**
 * Supabase Auth may respond with HTTP 200 and no error when the email is already
 * registered (anti-enumeration). In that case `user` is null or `user.identities` is empty.
 * @see https://supabase.com/docs/reference/javascript/auth-signup
 */
export const SIGNUP_EMAIL_ALREADY_REGISTERED_ERROR = "__teqbook_signup_email_already_registered__" as const;

/**
 * Use this in UI code instead of `error === SIGNUP_EMAIL_ALREADY_REGISTERED_ERROR`.
 * Some bundlers can instantiate `@teqbook/shared-core` more than once, which can break
 * strict `===` against the exported constant. The marker substring is matched literally here.
 */
export function isSignupEmailAlreadyRegisteredError(message: string | null | undefined): boolean {
  return typeof message === "string" && message.includes("__teqbook_signup_email_already_registered__");
}

function authErrorIndicatesExistingEmail(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("already registered") ||
    m.includes("already exists") ||
    m.includes("user already") ||
    m.includes("email already") ||
    m.includes("already been") ||
    m.includes("duplicate key value violates unique constraint") ||
    m.includes("unique violation")
  );
}

/** Duck-typed user from `supabase.auth.signUp` — avoids a runtime dependency on `User`. */
export function isSignUpEmailAlreadyRegistered(
  authError: { message: string } | null,
  user: { identities?: unknown[] | null } | null
): boolean {
  if (authError) {
    return authErrorIndicatesExistingEmail(authError.message);
  }
  if (!user) {
    return true;
  }
  return Array.isArray(user.identities) && user.identities.length === 0;
}
