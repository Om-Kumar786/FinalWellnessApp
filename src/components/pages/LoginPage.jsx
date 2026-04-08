import { useEffect, useRef, useState } from "react";
import {
  EmailAuthProvider,
  RecaptchaVerifier,
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { Chrome, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { auth, googleProvider, isFirebaseConfigured } from "../../lib/firebase";

const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123",
  role: "admin",
  active: true,
};

const PENDING_CREDENTIAL_SETUP_KEY = "pendingCredentialSetup";

const parseUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (!Array.isArray(users)) return [];
    return users.map((user) => ({
      ...user,
      active: user.active !== false,
    }));
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem("users", JSON.stringify(users));
};

const normalizePhone = (value) => value.replace(/\D/g, "").slice(-10);

const authProviderLabel = (providerId) => {
  if (providerId === "google.com") return "google";
  if (providerId === "phone") return "mobile-otp";
  return providerId || "firebase";
};

const findUserByIdentity = (users, firebaseUser) =>
  users.find(
    (user) =>
      user.email?.toLowerCase() === firebaseUser.email?.toLowerCase() ||
      user.mobile === firebaseUser.phoneNumber ||
      user.username === firebaseUser.displayName ||
      user.username === firebaseUser.email?.split("@")[0],
  );

const getFirebaseErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled before completion.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Please allow popups and try again.";
    case "auth/invalid-phone-number":
      return "Enter a valid mobile number with 10 digits.";
    case "auth/missing-phone-number":
      return "Please enter your mobile number first.";
    case "auth/invalid-verification-code":
      return "The OTP you entered is incorrect.";
    case "auth/code-expired":
      return "That OTP has expired. Request a new code and try again.";
    case "auth/too-many-requests":
      return "Too many authentication attempts were made. Please wait a bit and try again.";
    case "auth/billing-not-enabled":
      return "Firebase phone authentication requires billing to be enabled for your project.";
    case "auth/configuration-not-found":
      return "Phone authentication is not enabled in Firebase yet. Turn on the Phone provider in Firebase Console and save the configuration.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA verification failed. Please try sending the OTP again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase. Add localhost and your app domain under Authentication settings in Firebase Console.";
    case "auth/email-already-in-use":
      return "That email is already being used by another account.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "No matching account was found for those credentials.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/missing-email":
      return "Please enter your email address.";
    default:
      return error?.message || "Authentication failed. Please try again.";
  }
};

export default function LoginPage({ onLogin }) {
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [authMethod, setAuthMethod] = useState("google");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSentTo, setOtpSentTo] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [isCredentialSubmitting, setIsCredentialSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [verifiedProfile, setVerifiedProfile] = useState(null);
  const [credentialMode, setCredentialMode] = useState("create");
  const [credentialUsername, setCredentialUsername] = useState("");
  const [credentialPassword, setCredentialPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const recaptchaVerifierRef = useRef(null);
  const recaptchaContainerId = "phone-auth-recaptcha";

  useEffect(() => {
    const users = parseUsers();
    const hasAdmin = users.some((user) => user.role === "admin");
    if (!hasAdmin) {
      saveUsers([DEFAULT_ADMIN, ...users]);
    }
  }, []);

  useEffect(() => {
    return () => {
      localStorage.removeItem(PENDING_CREDENTIAL_SETUP_KEY);
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const sanitizedPhone = normalizePhone(mobileNumber);
  const isFirebaseReady = auth && googleProvider && isFirebaseConfigured;

  const completeLogin = (user) => {
    localStorage.removeItem(PENDING_CREDENTIAL_SETUP_KEY);

    const sessionUser = {
      username: user.username,
      role: user.role || "user",
      email: user.email || null,
      mobile: user.mobile || null,
      authProvider: user.authProvider || "local",
    };

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", sessionUser.username);
    localStorage.setItem("currentUser", JSON.stringify(sessionUser));
    onLogin(sessionUser);
  };

  const startCredentialStep = (firebaseUser) => {
    const users = parseUsers();
    const existingUser = findUserByIdentity(users, firebaseUser);

    if (existingUser?.active === false) {
      throw new Error("This account is currently deactivated. Please contact an administrator.");
    }

    const suggestedUsername =
      existingUser?.username ||
      firebaseUser.displayName?.replace(/\s+/g, "").toLowerCase() ||
      firebaseUser.email?.split("@")[0] ||
      `user${firebaseUser.phoneNumber?.slice(-4) || "0000"}`;

    localStorage.setItem(PENDING_CREDENTIAL_SETUP_KEY, "true");
    setVerifiedProfile({
      email: firebaseUser.email || null,
      mobile: firebaseUser.phoneNumber || null,
      authProvider: authProviderLabel(firebaseUser.providerData[0]?.providerId),
      existingUser,
    });
    setCredentialMode(existingUser?.firebaseEmail ? "login" : "create");
    setCredentialUsername(suggestedUsername);
    setCredentialPassword("");
    setRecoveryEmail(existingUser?.firebaseEmail || firebaseUser.email || "");
    setAuthError("");
    setResetMessage("");
  };

  const resetVerifiedFlow = async () => {
    setVerifiedProfile(null);
    setCredentialUsername("");
    setCredentialPassword("");
    setCredentialMode("create");
    setRecoveryEmail("");
    setConfirmationResult(null);
    setOtpCode("");
    setOtpSentTo("");
    localStorage.removeItem(PENDING_CREDENTIAL_SETUP_KEY);

    if (auth?.currentUser) {
      try {
        await signOut(auth);
      } catch {
        // Keep the local reset even if sign-out handshake fails.
      }
    }
  };

  const buildRecaptchaVerifier = () => {
    if (!auth) {
      throw new Error("Firebase authentication is not configured.");
    }

    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: "invisible",
    });

    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const handleAdminLogin = () => {
    setAuthError("");
    setResetMessage("");

    if (!adminUsername || !adminPassword) {
      setAuthError("Please enter admin username and password.");
      return;
    }

    const users = parseUsers();
    const validUser = users.find(
      (user) => user.username === adminUsername && user.password === adminPassword,
    );

    if (!validUser) {
      setAuthError("Invalid admin credentials.");
      return;
    }

    if (validUser.active === false) {
      setAuthError("This account is currently deactivated. Please contact an administrator.");
      return;
    }

    if (validUser.role !== "admin") {
      setAuthError("Admin access only. Please use admin credentials.");
      return;
    }

    completeLogin(validUser);
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setResetMessage("");

    if (!isFirebaseReady) {
      setAuthError("Firebase auth is not configured. Add your Firebase keys in the .env file.");
      return;
    }

    setIsGoogleLoading(true);
    localStorage.setItem(PENDING_CREDENTIAL_SETUP_KEY, "true");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      startCredentialStep(result.user);
    } catch (error) {
      localStorage.removeItem(PENDING_CREDENTIAL_SETUP_KEY);
      setAuthError(getFirebaseErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setAuthError("");
    setResetMessage("");

    if (!isFirebaseReady) {
      setAuthError("Firebase auth is not configured. Add your Firebase keys in the .env file.");
      return;
    }

    if (sanitizedPhone.length !== 10) {
      setAuthError("Enter a valid 10-digit mobile number.");
      return;
    }

    setIsOtpLoading(true);

    try {
      const verifier = buildRecaptchaVerifier();
      const result = await signInWithPhoneNumber(auth, `+91${sanitizedPhone}`, verifier);
      setConfirmationResult(result);
      setOtpSentTo(sanitizedPhone);
      setOtpCode("");
    } catch (error) {
      setAuthError(getFirebaseErrorMessage(error));
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthError("");
    setResetMessage("");

    if (!confirmationResult || typeof confirmationResult.confirm !== "function") {
      setAuthError("Send the OTP first, then enter the verification code.");
      return;
    }

    if (otpCode.trim().length !== 6) {
      setAuthError("Enter the 6-digit OTP sent to your mobile number.");
      return;
    }

    setIsOtpVerifying(true);
    localStorage.setItem(PENDING_CREDENTIAL_SETUP_KEY, "true");

    try {
      const result = await confirmationResult.confirm(otpCode.trim());
      startCredentialStep(result.user);
    } catch (error) {
      localStorage.removeItem(PENDING_CREDENTIAL_SETUP_KEY);
      setAuthError(getFirebaseErrorMessage(error));
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handleCredentialSubmit = async () => {
    setAuthError("");
    setResetMessage("");

    const nextUsername = credentialUsername.trim();
    const nextPassword = credentialPassword.trim();

    if (!verifiedProfile) {
      setAuthError("Please finish Google or OTP verification first.");
      return;
    }

    if (!nextUsername || !nextPassword) {
      setAuthError("Please enter username and password.");
      return;
    }

    setIsCredentialSubmitting(true);

    try {
      const users = parseUsers();
      const { existingUser, email, mobile, authProvider } = verifiedProfile;
      const usernameOwner = users.find((user) => user.username === nextUsername);
      const firebaseEmail = (existingUser?.firebaseEmail || email || recoveryEmail).trim().toLowerCase();

      if (credentialMode === "login" && existingUser?.firebaseEmail) {
        if (nextUsername !== existingUser.username) {
          setAuthError("Username does not match the verified account.");
          return;
        }

        if (!firebaseEmail) {
          setAuthError("This account does not have a recovery email yet. Please contact an admin.");
          return;
        }

        if (auth?.currentUser) {
          await signOut(auth);
        }
        await signInWithEmailAndPassword(auth, firebaseEmail, nextPassword);

        completeLogin({
          ...existingUser,
          email: email || existingUser.email || null,
          mobile: mobile || existingUser.mobile || null,
          authProvider: authProvider || existingUser.authProvider || "local",
          firebaseEmail,
        });
        return;
      }

      if (usernameOwner && usernameOwner.username !== existingUser?.username) {
        setAuthError("That username is already taken. Please choose another one.");
        return;
      }

      if (!firebaseEmail) {
        setAuthError("Please provide an email address so password reset links can be sent.");
        return;
      }

      const nextUser = {
        username: nextUsername,
        password: "",
        role: existingUser?.role || "user",
        active: existingUser?.active !== false,
        email: email || existingUser?.email || null,
        mobile: mobile || existingUser?.mobile || null,
        authProvider: authProvider || existingUser?.authProvider || "local",
        firebaseEmail,
      };

      const emailCredential = EmailAuthProvider.credential(firebaseEmail, nextPassword);
      if (auth?.currentUser) {
        await linkWithCredential(auth.currentUser, emailCredential);
      } else {
        setAuthError("Verification session expired. Please verify again.");
        return;
      }

      if (existingUser) {
        saveUsers(
          users.map((user) => (user.username === existingUser.username ? nextUser : user)),
        );
      } else {
        saveUsers([...users, nextUser]);
      }

      completeLogin(nextUser);
    } finally {
      setIsCredentialSubmitting(false);
    }
  };

  const handleSendResetLink = async () => {
    setAuthError("");
    setResetMessage("");

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail) {
      setAuthError("Please enter your recovery email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetMessage(`Password reset link sent to ${targetEmail}.`);
    } catch (error) {
      setAuthError(getFirebaseErrorMessage(error));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=90')",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_45%),linear-gradient(135deg,rgba(15,23,42,0.55),rgba(15,23,42,0.2))]" />

      <div className="relative z-10 mx-4 w-full max-w-md rounded-[2rem] border border-white/30 bg-[rgba(255,255,255,0.82)] p-8 text-[var(--text)] shadow-soft backdrop-blur-xl dark:bg-[rgba(15,23,42,0.8)]">
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--border)] bg-white/40 p-1 dark:bg-white/5">
          <button
            type="button"
            onClick={() => {
              setIsAdminPortal(false);
              setAuthError("");
            }}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${!isAdminPortal ? "btn-primary" : "btn-ghost"}`}
            disabled={Boolean(verifiedProfile)}
          >
            User Access
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminPortal(true);
              setAuthError("");
            }}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${isAdminPortal ? "btn-primary" : "btn-ghost"}`}
            disabled={Boolean(verifiedProfile)}
          >
            Admin Portal
          </button>
        </div>

        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted dark:bg-white/5">
            <ShieldCheck size={14} />
            Secure Sign In
          </span>
          <h1 className="mt-4 text-3xl font-bold">
            {isAdminPortal
              ? "Admin Portal"
              : verifiedProfile
                ? "Finish Your Account"
                : "Login your way"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isAdminPortal
              ? "Use administrator credentials to manage the Pulse platform."
              : verifiedProfile
                ? "Verification is complete. Now confirm your username and password to continue."
                : "Verify with Google or OTP first, then continue with username and password."}
          </p>
        </div>

        {!isFirebaseReady && !isAdminPortal && !verifiedProfile && (
          <div className="mb-5 rounded-2xl border border-amber-300/70 bg-amber-50/90 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            Firebase credentials are missing. Add the Firebase keys to your `.env` file before using
            Google sign-in or phone OTP.
          </div>
        )}

        {authError && (
          <div className="mb-5 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]">
            {authError}
          </div>
        )}

        {resetMessage && (
          <div className="mb-5 rounded-2xl border border-[var(--accent-3)]/30 bg-[rgba(34,197,94,0.12)] p-4 text-sm text-[var(--accent-3)]">
            {resetMessage}
          </div>
        )}

        {isAdminPortal ? (
          <>
            <input
              type="text"
              placeholder="Admin username"
              className="input mb-4 w-full rounded-xl px-4 py-3 transition placeholder:text-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Admin password"
              className="input mb-5 w-full rounded-xl px-4 py-3 transition placeholder:text-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={handleAdminLogin}
              className="btn-primary w-full rounded-xl py-3 font-medium transition duration-300 hover:brightness-110"
            >
              Login to Admin Portal
            </button>

            <p className="mt-4 text-center text-xs text-muted">
              Default admin: <span className="font-semibold">admin / admin123</span>
            </p>
          </>
        ) : verifiedProfile ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-4 dark:bg-white/5">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                  <KeyRound size={20} />
                </div>
                <div>
                  <p className="font-semibold">
                    {credentialMode === "login" ? "Username & Password Required" : "Create Credentials"}
                  </p>
                  <p className="text-sm text-muted">
                    {credentialMode === "login"
                      ? "This verified account already exists. Enter the saved username and password."
                      : "This verified account is new. Create a username, password, and recovery email if needed."}
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-muted">
                Verified by {verifiedProfile.authProvider === "google" ? "Google" : "mobile OTP"}
                {verifiedProfile.email ? ` | ${verifiedProfile.email}` : ""}
                {verifiedProfile.mobile ? ` | ${verifiedProfile.mobile}` : ""}
              </div>

              {!verifiedProfile.email && (
                <input
                  type="email"
                  placeholder="Recovery email for reset links"
                  className="input mb-3 w-full rounded-xl px-4 py-3 transition placeholder:text-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                />
              )}

              <input
                type="text"
                placeholder="Username"
                className="input mb-3 w-full rounded-xl px-4 py-3 transition placeholder:text-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                value={credentialUsername}
                onChange={(e) => setCredentialUsername(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="input w-full rounded-xl px-4 py-3 transition placeholder:text-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                value={credentialPassword}
                onChange={(e) => setCredentialPassword(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleCredentialSubmit}
              disabled={isCredentialSubmitting}
              className="btn-success w-full rounded-xl py-3 font-medium transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCredentialSubmitting
                ? "Saving..."
                : credentialMode === "login"
                  ? "Login with Username & Password"
                  : "Create Account and Login"}
            </button>

            <button
              type="button"
              onClick={resetVerifiedFlow}
              className="btn-ghost w-full rounded-xl py-3 font-medium transition hover:bg-[var(--surface-2)]"
            >
              Start Over
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--border)] bg-white/40 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("google");
                  setAuthError("");
                }}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${authMethod === "google" ? "btn-primary" : "btn-ghost"}`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("otp");
                  setAuthError("");
                }}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${authMethod === "otp" ? "btn-primary" : "btn-ghost"}`}
              >
                Mobile OTP
              </button>
            </div>

            {authMethod === "google" ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-4 dark:bg-white/5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                      <Chrome size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">Google Verification</p>
                      <p className="text-sm text-muted">
                        Verify your identity with Google, then continue with username and password.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || !isFirebaseReady}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white py-3 font-medium text-slate-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-50"
                >
                  <Chrome size={18} />
                  {isGoogleLoading ? "Opening Google..." : "Verify with Google"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-4 dark:bg-white/5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-[var(--accent-soft-2)] p-3 text-[var(--accent-2)]">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">Phone OTP Verification</p>
                      <p className="text-sm text-muted">
                        Verify your mobile number first, then continue with username and password.
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <span className="pr-3 text-sm font-semibold text-muted">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Mobile number"
                      className="w-full bg-transparent outline-none placeholder:text-[var(--muted-2)]"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isOtpLoading || !isFirebaseReady}
                    className="btn-primary mb-3 w-full rounded-xl py-3 font-medium transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isOtpLoading ? "Sending OTP..." : "Send OTP"}
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP"
                    className="input w-full rounded-xl px-4 py-3 transition placeholder:text-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />

                  {otpSentTo && (
                    <p className="mt-3 text-xs text-muted">OTP sent to +91 {otpSentTo}.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isOtpVerifying || !confirmationResult}
                  className="btn-success w-full rounded-xl py-3 font-medium transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isOtpVerifying ? "Verifying OTP..." : "Verify OTP"}
                </button>

                <div id={recaptchaContainerId} />
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white/50 p-4 dark:bg-white/5">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword((prev) => !prev);
                  setAuthError("");
                  setResetMessage("");
                }}
                className="text-sm font-medium text-[var(--accent)] underline"
              >
                {showForgotPassword ? "Hide reset option" : "Forgot password?"}
              </button>

              {showForgotPassword && (
                <div className="mt-4 space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your recovery email"
                    className="input w-full rounded-xl px-4 py-3 transition placeholder:text-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleSendResetLink}
                    className="btn-ghost w-full rounded-xl py-3 font-medium transition hover:bg-[var(--surface-2)]"
                  >
                    Send Reset Link
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <p className="mt-6 text-center text-xs text-muted">Student Wellness Portal</p>
      </div>
    </div>
  );
}
