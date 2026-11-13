import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  UserCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Unsubscribe
} from "firebase/auth";
import { auth } from "./client";

/**
 * Normalizes phone numbers to Rwandan E.164 international standard (+2507XXXXXXXX)
 */
export function formatRwandaPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  if (cleaned.startsWith("250")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+250${cleaned.substring(1)}`;
  }
  return `+250${cleaned}`;
}

/**
 * Initializes invisible or visible reCAPTCHA verifier required by Firebase Phone Auth
 */
export function setupRecaptcha(
  containerId: string = "recaptcha-container",
  size: "invisible" | "normal" = "invisible"
): RecaptchaVerifier {
  // Clear any existing verifier on window if running in browser
  if (typeof window !== "undefined" && (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier) {
    (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier?.clear();
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size,
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
      console.log("[Firebase Auth] reCAPTCHA verified successfully");
    },
    "expired-callback": () => {
      console.warn("[Firebase Auth] reCAPTCHA expired, please try again");
    },
  });

  if (typeof window !== "undefined") {
    (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier = verifier;
  }

  return verifier;
}

/**
 * Dispatches an SMS OTP verification code to the recipient's phone number
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const formatted = formatRwandaPhoneNumber(phoneNumber);
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formatted, verifier);
    return confirmationResult;
  } catch (error) {
    console.error("[Firebase Auth] Error sending phone OTP:", error);
    throw error;
  }
}

/**
 * Verifies the 6-digit OTP code entered by the user
 */
export async function confirmPhoneOtp(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<UserCredential> {
  try {
    const credential = await confirmationResult.confirm(code);
    return credential;
  } catch (error) {
    console.error("[Firebase Auth] Invalid verification code:", error);
    throw error;
  }
}

/**
 * Signs out the currently authenticated user
 */
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribes to Firebase Authentication state changes
 */
export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

