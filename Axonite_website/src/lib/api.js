// Shared backend access for the admin panel and the public pages.
// Set VITE_API_BASE_URL in .env to point at a non-local backend.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "admin_token";
const ADMIN_KEY = "admin_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredAdmin = () => {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSession = (token, admin) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};

// The main admin is the permanent owner account; every other account is
// temporary and can only be managed by the main admin.
export const isMainAdmin = (admin) => Boolean(admin?.is_main);

export const authHeaders = (extra = {}) => {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
};

/**
 * Authenticated fetch for the admin pages.
 *
 * Attaches the bearer token and returns the raw Response so existing callers
 * can keep doing `await response.json()` / checking `response.ok`. Request
 * bodies are passed through untouched, which keeps multipart FormData
 * uploads working (no JSON content-type is forced).
 */
export const authedFetch = (url, options = {}) =>
  fetch(url, { ...options, headers: authHeaders(options.headers) });

/**
 * fetch() wrapper that always resolves to { ok, status, data } and never
 * throws, so callers can show `data.error` directly to the user.
 */
export async function apiFetch(path, { method = "GET", body, headers, isForm = false } = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: authHeaders(
        isForm ? { ...headers } : { "Content-Type": "application/json", ...headers }
      ),
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "Cannot reach the server. Please check your connection and try again." },
    };
  }
}

export const errorMessage = (data, fallback = "Something went wrong. Please try again.") => {
  if (data && typeof data === "object") return data.error || data.message || fallback;
  if (typeof data === "string" && data.trim()) return data;
  return fallback;
};

// --- Auth endpoints ---

export const verifySession = () => apiFetch("/auth/verify", { method: "GET" });

export const fetchProfile = () => apiFetch("/auth/me");

export const requestPasswordOtp = (email) =>
  apiFetch("/auth/forgot-password", { method: "POST", body: { email } });

export const verifyOtp = (email, otp) =>
  apiFetch("/auth/verify-otp", { method: "POST", body: { email, otp } });

export const resetPassword = (email, otp, newPassword, confirmPassword) =>
  apiFetch("/auth/reset-password", {
    method: "POST",
    body: {
      email,
      otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    },
  });

export const changePassword = (currentPassword, newPassword, confirmPassword) =>
  apiFetch("/auth/change-password", {
    method: "POST",
    body: {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    },
  });

// --- Admin account management ---

export const listAdmins = () => apiFetch("/auth/admins", { method: "GET" });

export const createAdmin = (payload) =>
  apiFetch("/auth/admins", { method: "POST", body: payload });

export const updateAdmin = (adminId, payload) =>
  apiFetch(`/auth/admins/${adminId}`, { method: "PUT", body: payload });

export const deleteAdmin = (adminId) =>
  apiFetch(`/auth/admins/${adminId}`, { method: "DELETE" });
