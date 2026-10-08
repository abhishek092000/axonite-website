import { useEffect, useState } from "react";
import { getStats } from "../../lib/store";

const API_BASE_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pageviews: 0, sessions: 0, breakdown: {} });
  const [postCount, setPostCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);

  useEffect(() => {
    // Local device session visits
    setStats(getStats());

    // Fetch live SQL counts straight from database
    async function loadDatabaseCounts() {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/counts`);
        if (!response.ok) return;

        const data = await response.json();
        setPostCount(data.blog_count ?? 0);
        setJobCount(data.job_count ?? 0);
      } catch (err) {
        console.error("Error loading counts from database:", err);
      }
    }

    loadDatabaseCounts();
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-container">
      <p className="eyebrow mb-3">Overview</p>
      <h1 className="text-display-sm mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="Visits" value={stats.sessions} />
        <StatCard label="Blog posts" value={postCount} />
        <StatCard label="Open roles" value={jobCount} />
      </div>

      <div className="bg-accent-soft border border-accent/15 rounded-md p-6 mt-6">
        <p className="text-xs text-ink-2 leading-relaxed max-w-2xl">
          <strong className="text-ink">Database synced:</strong> Blog post and open role counts are queried directly from MySQL.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-6">
      <p className="font-mono-label text-[0.62rem] text-accent mb-2.5">{label}</p>
      <p className="font-serif text-[2rem] leading-none text-ink">{value}</p>
    </div>
  );
}