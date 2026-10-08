import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";
const emptyForm = { title: "", location: "", type: "Full-time", desc: "" };

export default function AdminCareers() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch jobs from the Flask MySQL backend
  async function refresh() {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`);
      if (!res.ok) throw new Error("Failed to load jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not load jobs from backend.");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      job_title: form.title,
      job_experience: form.experience,
      job_location: form.location,
      job_type: form.type,
      job_description: form.desc,
    };

    const isEdit = Boolean(editingId);
    const endpoint = isEdit ? `${API_BASE_URL}/jobs/${editingId}` : `${API_BASE_URL}/jobs`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEdit ? "update" : "create"} job post`);
      }

      setForm(emptyForm);
      setEditingId(null);
      await refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  
  function handleEdit(job) {
    setForm({
      title: job.job_title,
      experience: job.job_experience,
      location: job.job_location,
      type: job.job_type,
      desc: job.job_description,
    });
    setEditingId(job.job_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("Remove this role? This can't be undone.")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete job");
      }

      // If the currently edited job is deleted, reset the form
      if (editingId === id) {
        setForm(emptyForm);
        setEditingId(null);
      }

      // Refresh list from the database
      await refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to delete role");
    }
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
    setErrorMessage("");
  }

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-mono-label text-[0.66rem] text-accent mb-2">Content</p>
      <h1 className="text-display-xs mb-8">Careers</h1>

      {errorMessage && (
        <div className="mb-6 p-4 text-xs text-coral bg-coral/10 border border-coral/30 rounded-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-line rounded-md p-6 mb-10 space-y-4">
        <h2 className="text-[1.2rem] font-serif text-ink">
          {editingId ? "Edit role" : "New role"}
        </h2>
        <Field label="Job title" name="title" value={form.title} onChange={handleChange} required />
        <Field label="Experience" name="experience" value={form.experience} onChange={handleChange} required />
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Pune / Remote"
            required
          />
          <div>
            <label className="font-mono-label text-[0.62rem] text-ink-3 block mb-2">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-line rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors bg-white"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
        </div>
        <div>
          <label className="font-mono-label text-[0.62rem] text-ink-3 block mb-2">Description</label>
          <textarea
            name="desc"
            value={form.desc}
            onChange={handleChange}
            rows={3}
            required
            className="w-full border border-line rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-accent text-white font-mono-label text-[0.66rem] px-6 py-3 rounded-full transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : editingId
              ? "Save changes"
              : "Add role"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="font-mono-label text-[0.66rem] px-6 py-3 rounded-full border border-line hover:border-accent transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border border-line rounded-md divide-y divide-line">
        {jobs.length === 0 && <p className="p-6 text-sm text-ink-3">No open roles yet.</p>}
        {jobs.map((job) => (
          <div key={job.job_id} className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="font-serif text-ink truncate">
  {job.job_title}{' '}
  <span className="inline-block text-xs text-ink-3 mt-1"> {job.job_experience}</span>
</p>
              <p className="text-xs text-ink-3 mt-1">
                {job.job_location} · {job.job_type}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleEdit(job)}
                className="text-xs font-mono-label px-3 py-2 rounded-full border border-line hover:border-accent transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(job.job_id)}
                className="text-xs font-mono-label px-3 py-2 rounded-full border border-line text-coral hover:border-coral transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="font-mono-label text-[0.62rem] text-ink-3 block mb-2">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border border-line rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}