import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  errorMessage,
  requestPasswordOtp,
  resetPassword,
  verifyOtp,
} from "../../lib/api";
import AuthShell, {
  StatusMessage,
  Spinner,
  fieldClass,
  fieldLabelClass,
  primaryButtonClass,
} from "../components/AuthShell";

const OTP_LENGTH = 6;

const STEPS = [
  { key: "email", label: "Your email" },
  { key: "otp", label: "Verify code" },
  { key: "reset", label: "New password" },
];

function Stepper({ activeIndex }) {
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Reset progress">
      {STEPS.map((step, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <li key={step.key} className="flex flex-1 flex-col gap-2">
            <span
              className={`h-1 rounded-full transition-colors ${
                isActive ? "bg-accent" : isDone ? "bg-accent/45" : "bg-line"
              }`}
            />
            <span
              className={`font-mono-label text-[0.6rem] transition-colors ${
                isActive ? "text-accent" : "text-ink-3"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Six single-character boxes with auto-advance, backspace and paste support. */
function OtpField({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH);

  const setDigit = (index, digit) => {
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(""));
  };

  const handleChange = (index, raw) => {
    const chars = raw.replace(/\D/g, "");
    if (!chars) {
      setDigit(index, "");
      return;
    }

    // Typing or pasting several digits fills the following boxes.
    const next = [...digits];
    let cursor = index;
    for (const char of chars) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = char;
      cursor += 1;
    }
    onChange(next.join(""));
    inputs.current[Math.min(cursor, OTP_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigit(index - 1, "");
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="grid grid-cols-6 gap-2" role="group" aria-label="One-time password">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          autoFocus={i === 0}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="h-12 w-full min-w-0 rounded-md border border-line bg-paper text-center font-mono text-lg text-ink transition-colors focus:border-accent focus:outline-none disabled:opacity-60 sm:h-14 sm:text-xl"
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(10);

  // Land focus on the first OTP box as soon as that step appears.
  useEffect(() => {
    if (stepIndex === 1 && !loading) {
      document.querySelector('input[aria-label="Digit 1"]')?.focus();
    }
  }, [stepIndex, loading]);

  async function handleRequestOtp(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    const { ok, data } = await requestPasswordOtp(email.trim());
    setLoading(false);

    if (!ok) {
      setError(errorMessage(data, "Could not send the code. Please try again."));
      return;
    }

    setEmail(data.email || email.trim());
    setExpiryMinutes(data.expires_in_minutes || 10);
    setOtp("");
    setStepIndex(1);
  }

  async function handleResendOtp() {
    setError("");
    setNotice("");
    setLoading(true);
    const { ok, data } = await requestPasswordOtp(email);
    setLoading(false);

    if (!ok) {
      setError(errorMessage(data, "Could not resend the code. Please try again."));
      return;
    }

    setOtp("");
    setExpiryMinutes(data.expires_in_minutes || expiryMinutes);
    setNotice("A new code is on its way. The previous code no longer works.");
    document.querySelector('input[aria-label="Digit 1"]')?.focus();
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }

    setLoading(true);
    const { ok, data } = await verifyOtp(email, otp);
    setLoading(false);

    if (!ok) {
      setError(errorMessage(data, "Incorrect code. Please try again."));
      return;
    }

    setStepIndex(2);
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { ok, data } = await resetPassword(email, otp, password, confirmPassword);
    setLoading(false);

    if (!ok) {
      setError(errorMessage(data, "Could not reset your password. Please try again."));
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
            <svg
              className="h-6 w-6 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h2 className="text-display-xs mb-2">Password updated</h2>
          <p className="mb-8 text-sm leading-relaxed text-ink-2">
            Your password has been changed. Sign in with your new password to continue.
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/login", { replace: true })}
            className={primaryButtonClass}
          >
            Back to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <header className="mb-7">
        <p className="eyebrow mb-2.5">Account recovery</p>
        <h2 className="text-display-xs mb-2">Reset password</h2>
        <p className="text-sm text-ink-2">
          {stepIndex === 0 && "Enter your registered email and we'll send a one-time code."}
          {stepIndex === 1 && `Enter the ${OTP_LENGTH}-digit code we sent to ${email}.`}
          {stepIndex === 2 && "Choose a new password for your admin account."}
        </p>
      </header>

      <Stepper activeIndex={stepIndex} />

      <div className="space-y-4">
        <StatusMessage tone="error">{error}</StatusMessage>
        <StatusMessage tone={notice.includes("no longer") ? "info" : "success"}>
          {notice}
        </StatusMessage>

        {stepIndex === 0 && (
          <form onSubmit={handleRequestOtp} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className={fieldLabelClass}>
                Registered email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                autoComplete="email"
                disabled={loading}
                placeholder="admin@axonite.com"
                className={fieldClass}
              />
            </div>

            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading && <Spinner />}
              {loading ? "Sending code…" : "Send one-time code"}
            </button>
          </form>
        )}

        {stepIndex === 1 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
            <div>
              <label className={fieldLabelClass}>One-time code</label>
              <OtpField value={otp} onChange={setOtp} disabled={loading} />
              <p className="mt-2.5 text-xs text-ink-3">
                The code expires in {expiryMinutes} minutes and can be used once.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== OTP_LENGTH}
              className={primaryButtonClass}
            >
              {loading && <Spinner />}
              {loading ? "Verifying…" : "Verify code"}
            </button>

            <div className="flex items-center justify-between gap-3 pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStepIndex(0);
                  setOtp("");
                  setError("");
                  setNotice("");
                }}
                className="font-medium text-ink-3 transition-colors hover:text-ink"
              >
                Use a different email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="font-medium text-accent transition-colors hover:text-accent-strong disabled:opacity-60"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {stepIndex === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
            <div>
              <label htmlFor="new-password" className={fieldLabelClass}>
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
                placeholder="At least 8 characters"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className={fieldLabelClass}>
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
                placeholder="Re-enter new password"
                className={fieldClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className={primaryButtonClass}
            >
              {loading && <Spinner />}
              {loading ? "Updating…" : "Change password"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-7 text-center text-xs text-ink-3">
        Remembered it?{" "}
        <Link
          to="/admin/login"
          className="font-medium text-accent transition-colors hover:text-accent-strong"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
