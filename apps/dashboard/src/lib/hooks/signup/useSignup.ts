import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/services/auth-service";
import { upsertProfile } from "@/lib/services/profiles-service";
import { validatePassword } from "@/lib/utils/signup/signup-utils";

interface UseSignupOptions {
  locale: string;
  translations: {
    passwordMismatch: string;
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
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    // Validation
    if (!firstName.trim()) {
      setError(locale === "nb" ? "Fornavn er påkrevd" : "First name is required");
      setStatus("error");
      return;
    }

    if (!lastName.trim()) {
      setError(locale === "nb" ? "Etternavn er påkrevd" : "Last name is required");
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
      setError(locale === "nb" ? "Du må godta vilkårene" : "You must agree to the terms");
      setStatus("error");
      return;
    }

    try {
      // Sign up user (also stores name in auth user_metadata as backup)
      const { data: signUpData, error: signUpError } = await signUp(email, password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (signUpError || !signUpData?.user) {
        setError(signUpError || "Failed to create account");
        setStatus("error");
        return;
      }

      // Upsert profile with first name and last name
      // Uses upsert because the profiles row may not exist yet at signup time
      const { error: profileError } = await upsertProfile(signUpData.user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      if (profileError) {
        // Log error but don't block signup - profile can be updated later
        console.error("Failed to update profile:", profileError);
      }

      // Redirect to onboarding
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
    handleSubmit,
  };
}

