/**
 * Validate password according to security policy
 */
export interface PasswordValidationResult {
  valid: boolean;
  error: string | null;
}

export function validatePassword(password: string, locale: string): PasswordValidationResult {
  if (password.length < 8) {
    return {
      valid: false,
      error: locale === "nb" ? "Passordet må være minst 8 tegn" : "Password must be at least 8 characters",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error:
        locale === "nb"
          ? "Passordet må inneholde minst én stor bokstav"
          : "Password must contain at least one uppercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error:
        locale === "nb" ? "Passordet må inneholde minst ett tall" : "Password must contain at least one number",
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      error:
        locale === "nb"
          ? "Passordet må inneholde minst ett spesialtegn"
          : "Password must contain at least one special character",
    };
  }

  return { valid: true, error: null };
}

