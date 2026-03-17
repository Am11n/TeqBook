import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/services/auth-service";
import { updateProfile } from "@/lib/services/profiles-service";
import { validatePassword } from "@/lib/utils/signup/signup-utils";

interface UseSignupOptions {
  locale: string;
  translations: {
    passwordMismatch: string;
    firstNameRequired: string;
    lastNameRequired: string;
    termsRequired: string;
    confirmationSent: string;
  };
}

export function useSignup({ locale, translations }: UseSignupOptions) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resolveEmailRedirectTo = () => {
    const fallbackBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "https://teqbook.com");

    const redirectUrl = new URL("/login", fallbackBase);
    redirectUrl.searchParams.set("confirmed", "1");
    return redirectUrl.toString();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!firstName.trim()) {
      setError(translations.firstNameRequired);
      setStatus("error");
      return;
    }

    if (!lastName.trim()) {
      setError(translations.lastNameRequired);
      setStatus("error");
      return;
    }

    if (password !== confirmPassword) {
      setError(translations.passwordMismatch);
      setStatus("error");
      return;
    }

    // Password validation
    const passwordValidation = validatePassword(password, locale);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Invalid password");
      setStatus("error");
      return;
    }

    if (!agreeToTerms) {
      setError(translations.termsRequired);
      setStatus("error");
      return;
    }

    try {
      // Sign up user
      const { data: signUpData, error: signUpError } = await signUp(email, password, {
        redirectTo: resolveEmailRedirectTo(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (signUpError || !signUpData?.user) {
        setError(signUpError || "Failed to create account");
        setStatus("error");
        return;
      }

      // Update profile with first name and last name
      const { error: profileError } = await updateProfile(signUpData.user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      if (profileError) {
        // Log error but don't block signup - profile can be updated later
        console.error("Failed to update profile:", profileError);
      }

      // If email confirmation is required, Supabase returns no session.
      if (!signUpData.session) {
        setStatus("success");
        setSuccessMessage(translations.confirmationSent);
        return;
      }

      // Session exists -> user can continue onboarding immediately.
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
      setStatus("error");
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    agreeToTerms,
    setAgreeToTerms,
    status,
    error,
    successMessage,
    handleSubmit,
  };
}

