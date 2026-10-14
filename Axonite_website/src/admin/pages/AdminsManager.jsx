import { useEffect, useState } from "react";
import {
  createAdmin,
  deleteAdmin,
  errorMessage,
  listAdmins,
  updateAdmin,
} from "../../lib/api";
import { getAdminUser } from "../../lib/store";

const emptyForm = { admin_email: "", admin_username: "", admin_password: "" };

const inputClass =
  "w-full bg-paper border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent transition-colors disabled:opacity-50";

const labelClass = "font-mono-label text-[0.62rem] text-ink-3 block mb-2";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminsManager() {
  const currentAdmin = getAdminUser();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function refresh() {
    setLoading(true);
    const { ok, data } = await listAdmins();
    setLoading(false);

    if (!ok) {
      setError(errorMessage(data, "Could not load admin accounts."));
      return;
    }
    setAdmins(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    refresh();
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(admin) {
    setEditingId(admin.admin_id);
    setForm({
      admin_email: admin.admin_email || "",
      admin_username: admin.admin_username || "",
      admin_password: "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.admin_email.trim() || !form.admin_username.trim()) {
      setError("Email and username are required.");
      return;
    }

    if (!editingId && !form.admin_password) {
      setError("A password is required for a new admin.");
      return;
    }

    if (form.admin_password && form.admin_password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSaving(true);
    const payload = {
      admin_email: form.admin_email.trim(),
      admin_username: form.admin_username.trim(),
      admin_password: form.admin_password,
    };

    const { ok, data } = editingId
      ? await updateAdmin(editingId, payload)
      : await createAdmin(payload);
    setSaving(false);

    if (!ok) {
      setError(errorMessage(data, "Could not save the admin account."));
      return;
    }

    const wasEditing = Boolean(editingId);
    closeForm();
    setSuccess(
      wasEditing ? "Temporary admin updated." : "Temporary admin account created."
    );
    refresh();
  }

  async function handleDelete(admin) {
    setError("");
    setSuccess("");

    if (!window.confirm(`Delete the temporary admin account "${admin.admin_username}"?`)) return;

    const { ok, data } = await deleteAdmin(admin.admin_id);
    if (!ok) {
      setError(errorMessage(data, "Could not delete the admin account."));
      return;
    }

    setSuccess("Temporary admin account deleted.");
    refresh();
  }

  return (
    <div className="p-6 sm:p-8 max-w-container">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-3">Access control</p>
          <h1 className="text-display-sm">Admin accounts</h1>
          <p className="text-ink-2 text-sm mt-2 max-w-prose">
            You are signed in as the <strong className="text-ink">main admin</strong>. Accounts you
            add here are temporary logins for staff — you can edit or remove them at any time. The
            main admin account is permanent and cannot be deleted.
          </p>
        </div>

        <button
          type="button"
          onClick={showForm ? closeForm : openCreateForm}
          className="bg-accent text-white font-semibold text-sm px-5 py-3 rounded-full transition-colors hover:bg-accent-strong"
        >
          {showForm ? "Cancel" : "Add temporary admin"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-coral bg-coral/10 border border-coral/30 rounded-sm px-3 py-2 mb-4 max-w-2xl">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-accent-strong bg-accent-soft border border-accent/15 rounded-sm px-3 py-2 mb-4 max-w-2xl">
          {success}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-line rounded-md p-6 mb-8 shadow-card max-w-2xl"
        >
          <h2 className="text-lg mb-5">
            {editingId ? "Edit temporary admin" : "New temporary admin"}
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.admin_email}
                onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                required
                disabled={saving}
                placeholder="name@axonite.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={form.admin_username}
                onChange={(e) => setForm({ ...form, admin_username: e.target.value })}
                required
                disabled={saving}
                placeholder="login name"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass}>
              {editingId ? "New password (leave blank to keep current)" : "Password"}
            </label>
            <input
              type="password"
              value={form.admin_password}
              onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
              required={!editingId}
              minLength={8}
              autoComplete="new-password"
              disabled={saving}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-white font-semibold text-sm px-5 py-3 rounded-full transition-colors hover:bg-accent-strong disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Create admin"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="text-sm text-ink-3 hover:text-ink px-3 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-line rounded-md shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className={labelClass + " px-5 pt-5"}>Username</th>
                <th className={labelClass + " px-5 pt-5"}>Email</th>
                <th className={labelClass + " px-5 pt-5"}>Added</th>
                <th className={labelClass + " px-5 pt-5 text-right"}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-ink-3">
                    Loading admin accounts...
                  </td>
                </tr>
              )}

              {!loading && admins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-ink-3">
                    No admin accounts found.
                  </td>
                </tr>
              )}

              {!loading &&
                admins.map((admin) => {
                  const isSelf = admin.admin_id === currentAdmin?.admin_id;
                  const isMain = admin.is_main;
                  return (
                    <tr key={admin.admin_id} className="border-b border-line-soft last:border-0">
                      <td className="px-5 py-4 text-ink font-medium">
                        {admin.admin_username}
                        {isMain && (
                          <span className="ml-2 align-middle text-[0.62rem] font-mono-label text-gold bg-gold-soft border border-gold/25 rounded-full px-2 py-0.5">
                            Main admin
                          </span>
                        )}
                        {!isMain && (
                          <span className="ml-2 align-middle text-[0.62rem] font-mono-label text-ink-3 bg-paper-alt border border-line rounded-full px-2 py-0.5">
                            Temporary
                          </span>
                        )}
                        {isSelf && (
                          <span className="ml-2 align-middle text-[0.62rem] font-mono-label text-accent bg-accent-soft border border-accent/15 rounded-full px-2 py-0.5">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-ink-2">{admin.admin_email}</td>
                      <td className="px-5 py-4 text-ink-3">{formatDate(admin.created_date)}</td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isMain ? (
                          <span className="text-xs text-ink-3">Permanent account</span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditForm(admin)}
                              className="text-xs text-accent hover:text-accent-strong underline underline-offset-2 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(admin)}
                              className="text-xs text-coral hover:opacity-80 underline underline-offset-2"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
