import { describe, expect, it } from "vitest";
import { isSignUpEmailAlreadyRegistered, SIGNUP_EMAIL_ALREADY_REGISTERED_ERROR } from "./signup-email-already-registered";

describe("isSignUpEmailAlreadyRegistered", () => {
  it("returns false for a new user with an email identity", () => {
    expect(isSignUpEmailAlreadyRegistered(null, { identities: [{ provider: "email" }] })).toBe(false);
  });

  it("returns true when identities is an empty array (Supabase duplicate signal)", () => {
    expect(isSignUpEmailAlreadyRegistered(null, { identities: [] })).toBe(true);
  });

  it("returns true when user is null and there is no auth error", () => {
    expect(isSignUpEmailAlreadyRegistered(null, null)).toBe(true);
  });

  it("returns true for explicit duplicate-related auth errors", () => {
    expect(isSignUpEmailAlreadyRegistered({ message: "User already registered" }, null)).toBe(true);
    expect(isSignUpEmailAlreadyRegistered({ message: "Email address already exists" }, null)).toBe(true);
  });

  it("returns false for unrelated auth errors", () => {
    expect(isSignUpEmailAlreadyRegistered({ message: "Password should be at least 6 characters" }, null)).toBe(
      false
    );
  });
});

describe("SIGNUP_EMAIL_ALREADY_REGISTERED_ERROR", () => {
  it("is a stable sentinel string", () => {
    expect(SIGNUP_EMAIL_ALREADY_REGISTERED_ERROR).toContain("teqbook");
  });
});
