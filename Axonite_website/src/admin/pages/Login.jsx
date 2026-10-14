import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL, getToken, saveSession } from "../../lib/api";
import AuthShell, {
  StatusMessage,
  Spinner,
  fieldClass,
  fieldLabelClass,
  primaryButtonClass,
} from "../components/AuthShell";

function EyeIcon({ open }) {
  return (
    <svg
      className="h-[1.05rem] w-[1.05rem]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M2 12s3.6-6.4 10-6.4S22 12 22 12s-3.6 6.4-10 6.4S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c6.4 0 10 6 10 6a17.4 17.4 0 0 1-3 3.7" />
          <path d="M6.3 7.9A17 17 0 0 0 2 12s3.6 6 10 6a9.8 9.8 0 0 0 4-.8" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
      )}
    </svg>
  );
}

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Skip the form when a session is already stored
  useEffect(() => {
    if (getToken()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username.trim(), password }),
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error(data.error || "Incorrect username or password.");
      }

      saveSession(data.token, data.admin);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <header className="mb-7 text-center lg:text-left">
        <p className="eyebrow mb-2.5 justify-center lg:justify-start">Restricted</p>
        <h2 className="text-display-xs mb-2">Admin sign in</h2>
        <p className="text-sm text-ink-2">Restricted to Axonite staff.</p>
      </header>

      <div className="space-y-4">
        <StatusMessage tone="error">{error}</StatusMessage>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="identifier" className={fieldLabelClass}>
              Username or email
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
              autoComplete="username"
              disabled={loading}
              placeholder="Enter username or email"
              className={fieldClass}
            />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <label htmlFor="password" className={`${fieldLabelClass} mb-0`}>
                Password
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-xs font-medium text-accent transition-colors hover:text-accent-strong"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                placeholder="Enter password"
                className={`${fieldClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-ink-3 transition-colors hover:text-ink focus:outline-none focus-visible:text-ink"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading && <Spinner />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="mt-7 text-center text-xs leading-relaxed text-ink-3">
        Access is logged. Contact the main admin if you need an account.
      </p>
    </AuthShell>
  );
}
