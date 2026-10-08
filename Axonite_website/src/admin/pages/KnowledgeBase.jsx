import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api";

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [docCategory, setDocCategory] = useState("company_overview");
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rag/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch {
      // Fallback empty state
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", docCategory);

    try {
      const res = await fetch(`${API_BASE_URL}/rag/ingest-document`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "Document uploaded and indexed successfully!" });
        setFile(null);
        // Reset file input element
        e.target.reset();
        fetchDocuments();
      } else {
        setStatusMessage({ type: "error", text: data.message || "Failed to ingest document." });
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: "Network error occurred while uploading." });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId, filename) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${filename}"? This will also purge its embeddings from AI memory.`
    );
    if (!confirmed) return;

    setDeletingId(docId);
    setStatusMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/rag/documents/${docId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: data.message || "Document deleted successfully." });
        setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
      } else {
        setStatusMessage({ type: "error", text: data.message || "Failed to delete document." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error occurred while deleting." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleReindexAll = async () => {
    if (!window.confirm("Re-indexing will recreate all vector embeddings from scratch. Continue?")) return;

    setReindexing(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/rag/rebuild-index`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "Vector index recreated successfully!" });
      } else {
        setStatusMessage({ type: "error", text: data.message || "Re-indexing failed." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Server error during re-indexing." });
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-container space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-display-xs">AI Knowledge Base (RAG)</h1>
          <p className="text-sm text-ink-2 mt-1">
            Manage company context, service catalogs, and PDF documents queried by the website chatbot.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReindexAll}
          disabled={reindexing}
          className="px-4 py-2.5 font-semibold text-[0.8125rem] rounded-sm bg-dark text-ink-inverse hover:bg-dark-2 disabled:opacity-50 transition-colors"
        >
          {reindexing ? "Rebuilding Vector Index..." : "⚡ Rebuild Vector Index"}
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-sm text-xs font-medium ${
            statusMessage.type === "success"
              ? "bg-accent-soft text-accent-ink border border-accent/25"
              : "bg-coral/10 text-coral border border-coral/30"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1 card p-5">
          <h2 className="font-serif text-[1.05rem] text-ink mb-1">Upload New PDF Source</h2>
          <p className="text-xs text-ink-2 mb-4">
            Upload updated brochures, case studies, or FAQs to inject into the vector store.
          </p>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="font-mono-label text-[0.62rem] text-ink-3 block mb-2">
                Category
              </label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-line rounded-sm text-xs bg-paper text-ink focus:outline-none focus:border-accent"
              >
                <option value="company_overview">Company Overview & About</option>
                <option value="services_pricing">Services & Tech Stacks</option>
                <option value="case_studies">Company's Products</option>
                <option value="policies_terms">Policies & Client FAQs</option>
               
              </select>
            </div>

            <div>
              <label className="font-mono-label text-[0.62rem] text-ink-3 block mb-2">
                PDF Document
              </label>
              <input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-ink-3 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-paper-alt file:text-ink hover:file:bg-line cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-3 px-4 font-semibold text-[0.8125rem] rounded-sm bg-accent text-white hover:bg-accent-strong disabled:opacity-50 transition-colors"
            >
              {uploading ? "Extracting & Embedding..." : "Upload & Ingest PDF"}
            </button>
          </form>
        </div>

        {/* Existing Documents List */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-serif text-[1.05rem] text-ink mb-1">Indexed Knowledge Sources</h2>
          <p className="text-xs text-ink-2 mb-4">
            Files currently referenced by the Retrieval-Augmented Generation pipeline.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-alt text-ink-2 border-b border-line">
                <tr>
                  <th className="px-4 py-2.5">Document</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Chunks</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-ink-3">
                      No documents indexed yet. Upload a PDF on the left to start.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.document_id} className="hover:bg-paper">
                      <td className="px-4 py-3 font-medium text-ink flex items-center gap-2">
                        <span>📄</span>
                        <span className="truncate max-w-xs">{doc.filename}</span>
                      </td>
                      <td className="px-4 py-3 text-ink-3 capitalize">{doc.category?.replace("_", " ")}</td>
                      <td className="px-4 py-3 font-mono text-ink-2">{doc.chunk_count || 0}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 font-mono-label text-[0.6rem] rounded-full bg-accent-soft text-accent border border-accent/20">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.document_id, doc.filename)}
                          disabled={deletingId === doc.document_id}
                          className="px-2.5 py-1.5 text-[0.72rem] font-semibold text-coral bg-coral/10 hover:bg-coral/20 border border-coral/30 rounded-sm transition-colors disabled:opacity-50"
                        >
                          {deletingId === doc.document_id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}