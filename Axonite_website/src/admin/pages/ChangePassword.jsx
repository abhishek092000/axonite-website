import { useState } from "react";
import { changePassword, errorMessage } from "../../lib/api";
import { getAdminUser } from "../../lib/store";

const inputClass =
  "w-full bg-paper border border-line rounded-sm px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent transition-colors disabled:opacity-50";

const labelClass = "font-mono-label text-[0.62rem] text-ink-3 block mb-2";

export default function ChangePassword() {
  const admin = getAdminUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    const { ok, data } = await changePassword(currentPassword, newPassword, confirmPassword);
    setSaving(false);

    if (!ok) {
      setError(errorMessage(data, "Could not update your password. Please try again."));
      return;
    }

    reset();
    setSuccess(data.message || "Password changed successfully.");
  }

  return (
    <div className="p-6 sm:p-8 max-w-container">
      <p className="eyebrow mb-3">Account</p>
      <h1 className="text-display-sm mb-2">Change password</h1>
      <p className="text-ink-2 text-sm mb-8 max-w-prose">
        Signed in as <span className="text-ink font-medium">{admin?.admin_username || "admin"}</span>
        {admin?.admin_email ? ` (${admin.admin_email})` : ""}
        {admin?.is_main ? " — main admin account" : " — temporary account"}.
        You'll stay signed in on this device.
      </p>

      <div className="bg-white border border-line rounded-md p-6 sm:p-8 max-w-lg shadow-card">
        {error && (
          <p className="text-sm text-coral bg-coral/10 border border-coral/30 rounded-sm px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-accent-strong bg-accent-soft border border-accent/15 rounded-sm px-3 py-2 mb-4">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={saving}
              placeholder="Enter current password"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={saving}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={saving}
              placeholder="Re-enter new password"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
