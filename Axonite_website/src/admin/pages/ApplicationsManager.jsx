import React, { useState, useEffect, useMemo, Fragment } from "react";

const API_BASE_URL = "http://localhost:5000/api";

const mapStatusToString = (statusVal) => {
  if (typeof statusVal === "string" && isNaN(Number(statusVal))) return statusVal;
  switch (Number(statusVal)) {
    case 1:
      return "New";
    case 2:
      return "Round 1 Scheduled";
    case 3:
      return "Round 2 Scheduled";
    case 4:
      return "Round 3 Scheduled";
    case 5:
      return "Selected";
    case 6:
      return "Rejected";
    default:
      return "New";
  }
};

const mapStringToStatus = (statusStr) => {
  switch (statusStr) {
    case "New":
      return 1;
    case "Round 1 Scheduled":
      return 2;
    case "Round 2 Scheduled":
      return 3;
    case "Round 3 Scheduled":
      return 4;
    case "Selected":
      return 5;
    case "Rejected":
      return 6;
    default:
      return 1;
  }
};

// Accurately determine the active round stage based strictly on candidate status
const getApplicantRound = (app) => {
  const raw = Number(app.rawStatus);
  const status = app.status || "";

  if (raw === 2 || status === "Round 1 Scheduled") return 1;
  if (raw === 3 || status === "Round 2 Scheduled") return 2;
  if (raw === 4 || status === "Round 3 Scheduled") return 3;
  if (status === "Scheduled") return 1;

  // New (1), Selected (5), and Rejected (6) have no active scheduled round
  return 0;
};

export default function ApplicationsManager() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [activeModalId, setActiveModalId] = useState(null);
  const [targetRound, setTargetRound] = useState(1);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  // Form state for scheduling
  const [scheduleData, setScheduleData] = useState({
    dateTime: "",
    mode: "Online",
    locationOrLink: "",
  });

  const fetchApplications = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const response = await fetch(`${API_BASE_URL}/applied_jobs`);
      const isJson = response.headers.get("content-type")?.includes("application/json");
      const result = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMsg = isJson
          ? result.details
            ? `${result.error}: ${result.details}`
            : result.error
          : result;
        throw new Error(errorMsg || `Server returned status ${response.status}`);
      }

      const rawApps = Array.isArray(result) ? result : [];

      const formatted = await Promise.all(
        rawApps.map(async (item) => {
          let latestInterview = null;

          try {
            const intRes = await fetch(`${API_BASE_URL}/candidate/${item.user_id}/interviews`);
            if (intRes.ok) {
              const intData = await intRes.json();
              if (intData.interviews && intData.interviews.length > 0) {
                const last = intData.interviews[intData.interviews.length - 1];
                latestInterview = {
                  round: last.round_number,
                  dateTime: last.scheduled_at,
                  mode: last.interview_mode === "online" ? "Online" : "Offline",
                  locationOrLink: last.interview_mode === "online" ? last.meeting_link : last.location,
                };
              }
            }
          } catch {
            // Keep latestInterview as null
          }

          return {
            id: item.user_id,
            jobId: item.job_id,
            candidateName: item.user_name || "Unknown",
            email: item.user_email || "",
            phone: item.user_mobile || "",
            qualification: item.user_qualification || "",
            experience: item.user_experience || "",
            city: item.user_residential || "",
            role: item.job_title || "General Application",
            jobExperience: item.job_experience || "",
            status: mapStatusToString(item.user_status),
            rawStatus: item.user_status,
            appliedDate: item.applied_date || "",
            linkedinUrl: item.user_linkedin || "",
            resumeUrl: item.user_resume
              ? `${API_BASE_URL}/applied_jobs/resume/${item.user_resume}`
              : null,
            interview: latestInterview,
          };
        })
      );

      setApps(formatted);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setFetchError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const toggleRowExpand = (id) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const handleStatusChange = async (id, newStatus) => {
    const statusInt = mapStringToStatus(newStatus);
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus, rawStatus: statusInt } : a))
    );

    try {
      await fetch(`${API_BASE_URL}/applied_jobs/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_status: statusInt }),
      });
    } catch (err) {
      console.warn("Backend status update error:", err);
    }
  };

  const handleOpenScheduleModal = (app, roundNumber, reschedule = false) => {
    setActiveModalId(app.id);
    setTargetRound(roundNumber);
    setIsRescheduling(reschedule);

    if (reschedule && app.interview) {
      setScheduleData({
        dateTime: app.interview.dateTime ? app.interview.dateTime.slice(0, 16) : "",
        mode: app.interview.mode || "Online",
        locationOrLink: app.interview.locationOrLink || "",
      });
    } else {
      setScheduleData({
        dateTime: "",
        mode: "Online",
        locationOrLink: "",
      });
    }
  };

  const handleScheduleSubmit = async (e, id) => {
    e.preventDefault();
    if (!scheduleData.dateTime) return;

    setSchedulingLoading(true);
    const targetApp = apps.find((a) => a.id === id);
    const roundStatus = `Round ${targetRound} Scheduled`;
    const statusInt = mapStringToStatus(roundStatus);

    const endpoint = isRescheduling
      ? `${API_BASE_URL}/reschedule-interview`
      : `${API_BASE_URL}/schedule-interview`;

    const method = isRescheduling ? "PATCH" : "POST";

    const payload = {
      user_id: id,
      job_id: targetApp?.jobId || 0,
      round_number: targetRound,
      round_name: `Round ${targetRound}`,
      interview_mode: scheduleData.mode.toLowerCase(),
      scheduled_at: scheduleData.dateTime,
      meeting_link: scheduleData.mode === "Online" ? scheduleData.locationOrLink : "",
      location: scheduleData.mode === "Offline" ? scheduleData.locationOrLink : "",
      status: roundStatus,
      user_status: statusInt,
    };

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to process interview schedule.");
        setSchedulingLoading(false);
        return;
      }

      // Persist status change to applied_jobs table
      await fetch(`${API_BASE_URL}/applied_jobs/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_status: statusInt }),
      });

      // Update state
      setApps((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status: roundStatus,
                rawStatus: statusInt,
                interview: {
                  round: targetRound,
                  dateTime: scheduleData.dateTime,
                  mode: scheduleData.mode,
                  locationOrLink: scheduleData.locationOrLink,
                },
              }
            : app
        )
      );

      setActiveModalId(null);
    } catch (error) {
      console.error("Error submitting schedule:", error);
      alert("Unable to connect to the server.");
    } finally {
      setSchedulingLoading(false);
    }
  };

  const availableRoles = useMemo(() => {
    const roles = apps.map((a) => a.role).filter(Boolean);
    return Array.from(new Set(roles));
  }, [apps]);

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const qualification = app.qualification || "";
      const searchTarget = `${app.candidateName || ""} ${app.email || ""} ${
        app.city || ""
      } ${qualification}`.toLowerCase();

      if (searchQuery.trim() && !searchTarget.includes(searchQuery.toLowerCase().trim())) {
        return false;
      }

      if (selectedRole !== "all" && app.role !== selectedRole) {
        return false;
      }

      if (selectedStatus !== "all") {
        if (selectedStatus === "New") {
          if (app.status !== "New" && app.rawStatus !== 1) return false;
        } else if (selectedStatus === "Scheduled") {
          if (!app.status?.includes("Scheduled") && ![2, 3, 4].includes(Number(app.rawStatus))) {
            return false;
          }
        } else if (selectedStatus === "Round 1") {
          if (app.status !== "Round 1 Scheduled" && Number(app.rawStatus) !== 2) return false;
        } else if (selectedStatus === "Round 2") {
          if (app.status !== "Round 2 Scheduled" && Number(app.rawStatus) !== 3) return false;
        } else if (selectedStatus === "Round 3") {
          if (app.status !== "Round 3 Scheduled" && Number(app.rawStatus) !== 4) return false;
        } else if (selectedStatus === "Selected") {
          if (app.status !== "Selected" && Number(app.rawStatus) !== 5) return false;
        } else if (selectedStatus === "Rejected") {
          if (app.status !== "Rejected" && Number(app.rawStatus) !== 6) return false;
        }
      }

      if (filterDate && app.appliedDate) {
        if (new Date(app.appliedDate) < new Date(filterDate)) return false;
      }

      if (selectedExperience !== "all") {
        const expDigits = parseInt(app.experience, 10);
        const expNum = isNaN(expDigits) ? 0 : expDigits;

        if (selectedExperience === "fresher" && expNum > 0) return false;
        if (selectedExperience === "1-3" && (expNum < 1 || expNum > 3)) return false;
        if (selectedExperience === "3-5" && (expNum < 3 || expNum > 5)) return false;
        if (selectedExperience === "5+" && expNum < 5) return false;
      }

      return true;
    });
  }, [apps, searchQuery, selectedRole, selectedStatus, filterDate, selectedExperience]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("all");
    setSelectedExperience("all");
    setSelectedStatus("all");
    setFilterDate("");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedRole !== "all" ||
    selectedExperience !== "all" ||
    selectedStatus !== "all" ||
    filterDate;

  const statusFilterOptions = [
    { key: "all", label: "All" },
    { key: "New", label: "New" },
    { key: "Scheduled", label: "All Scheduled" },
    { key: "Round 1", label: "Round 1" },
    { key: "Round 2", label: "Round 2" },
    { key: "Round 3", label: "Round 3" },
    { key: "Selected", label: "Selected" },
    { key: "Rejected", label: "Rejected" },
  ];

  const StatusBadge = ({ app }) => {
    const isR1 = app.status === "Round 1 Scheduled" || Number(app.rawStatus) === 2;
    const isR2 = app.status === "Round 2 Scheduled" || Number(app.rawStatus) === 3;
    const isR3 = app.status === "Round 3 Scheduled" || Number(app.rawStatus) === 4;
    const isScheduled = app.status?.includes("Scheduled") || isR1 || isR2 || isR3;

    return (
      <span
        className={`inline-block px-2 py-0.5 text-[10px] leading-tight rounded-full font-medium ${
          isR1
            ? "bg-accent-soft text-accent-strong border border-accent/30"
            : isR2
            ? "bg-accent-soft text-accent border border-accent/30"
            : isR3
            ? "bg-accent-soft text-gold border border-gold/30"
            : isScheduled
            ? "bg-accent-soft text-accent-strong border border-accent/30"
            : app.status === "Selected"
            ? "bg-accent-soft text-accent border border-accent/25"
            : app.status === "Rejected"
            ? "bg-coral/10 text-coral border border-coral/30"
            : "bg-gold-soft text-gold border border-gold/30"
        }`}
      >
        {app.status || "New"}
      </span>
    );
  };

  const InterviewDetails = ({ app }) => {
    const isScheduled = app.status?.includes("Scheduled");
    if (!isScheduled || !app.interview) return null;
    return (
      <div className="mt-1 max-w-[160px] space-y-0.5 overflow-hidden rounded-md border border-line bg-paper-alt px-1.5 py-1 text-[9px] leading-tight text-ink-2">
        <div className="flex items-center gap-1.5 truncate font-medium text-ink">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="truncate">
            Round {app.interview.round || 1} ({app.interview.mode})
          </span>
        </div>
        <p className="truncate whitespace-nowrap font-mono text-[9px] text-ink-3">
          {new Date(app.interview.dateTime).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        {app.interview.locationOrLink && (
          <p className="truncate whitespace-nowrap text-[9px] text-ink-2">
            {app.interview.mode === "Online" ? "Link: " : "Venue: "}
            {app.interview.mode === "Online" ? (
              <a
                href={app.interview.locationOrLink}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline font-mono"
              >
                {app.interview.locationOrLink}
              </a>
            ) : (
              <span className="font-mono">{app.interview.locationOrLink}</span>
            )}
          </p>
        )}
      </div>
    );
  };

  const ActionButtons = ({ app, currentRound, wrap }) => {
    const isSelected = app.status === "Selected" || Number(app.rawStatus) === 5;
    const isRejected = app.status === "Rejected" || Number(app.rawStatus) === 6;

    if (isSelected || isRejected) return null;

    return (
      <div className="mx-auto grid w-fit min-w-[156px] grid-cols-2 gap-1.5">
        {/* Dynamic progressive scheduling */}
        {currentRound === 0 && (
          <button
            type="button"
            onClick={() => handleOpenScheduleModal(app, 1, false)}
            className="flex min-h-7 w-full items-center justify-center px-1.5 py-1 text-center font-mono-label text-[0.62rem] leading-tight text-accent-strong bg-accent-soft hover:bg-accent/20 rounded border border-accent/30 transition-colors"
          >
            Schedule R1
          </button>
        )}
        {currentRound === 1 && (
          <button
            type="button"
            onClick={() => handleOpenScheduleModal(app, 2, false)}
            className="flex min-h-7 w-full items-center justify-center px-1.5 py-1 text-center font-mono-label text-[0.62rem] leading-tight text-accent bg-accent-soft hover:bg-accent/10 rounded border border-accent/30 transition-colors"
          >
            Schedule R2
          </button>
        )}
        {currentRound === 2 && (
          <button
            type="button"
            onClick={() => handleOpenScheduleModal(app, 3, false)}
            className="flex min-h-7 w-full items-center justify-center px-1.5 py-1 text-center font-mono-label text-[0.62rem] leading-tight text-gold bg-accent-soft hover:bg-accent/10 rounded border border-gold/30 transition-colors"
          >
            Schedule R3
          </button>
        )}

        {/* Select candidate (available only once at least round 1 is reached) */}
        {currentRound > 0 && (
          <button
            type="button"
            onClick={() => handleStatusChange(app.id, "Selected")}
            className="flex min-h-7 w-full items-center justify-center px-1.5 py-1 text-center font-mono-label text-[0.62rem] leading-tight text-accent bg-accent-soft hover:bg-accent/10 rounded border border-accent/25 transition-colors"
          >
            Select
          </button>
        )}

        {/* Reschedule Button: Only show if an interview has actually been scheduled */}
        {currentRound > 0 && (
          <button
            type="button"
            onClick={() => handleOpenScheduleModal(app, currentRound, true)}
            className="flex min-h-7 w-full items-center justify-center px-1.5 py-1 text-center font-mono-label text-[0.62rem] leading-tight text-gold bg-gold-soft hover:bg-gold-soft rounded border border-gold/30 transition-colors"
          >
            Reschedule
          </button>
        )}

        {/* Reject Candidate */}
        <button
          type="button"
          onClick={() => handleStatusChange(app.id, "Rejected")}
          className="flex min-h-7 w-full items-center justify-center px-1.5 py-1 text-center font-mono-label text-[0.62rem] leading-tight text-coral bg-coral/10 hover:bg-coral/15 rounded border border-coral/30 transition-colors"
        >
          Reject
        </button>
      </div>
    );
  };

  const DetailsGrid = ({ app, cols = "grid-cols-2 md:grid-cols-5" }) => (
    <div className={`grid ${cols} gap-4 text-xs`}>
      <div>
        <span className="text-ink-3 font-medium block">Phone Number</span>
        <span className="text-ink font-mono">{app.phone || "Not provided"}</span>
      </div>
      <div>
        <span className="text-ink-3 font-medium block">Experience</span>
        <span className="text-ink">{app.experience || "Not provided"}</span>
      </div>
      <div>
        <span className="text-ink-3 font-medium block">City</span>
        <span className="text-ink">{app.city || "Not provided"}</span>
      </div>
      <div>
        <span className="text-ink-3 font-medium block">LinkedIn</span>
        {app.linkedinUrl ? (
          <a
            href={app.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline truncate block"
          >
            {app.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        ) : (
          <span className="text-ink-3">Not provided</span>
        )}
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center text-ink-3">
      <svg className="w-8 h-8 text-line" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm font-medium text-ink-3">
        {fetchError ? "Failed to load applications" : "No matching applications found"}
      </p>
      {fetchError && (
        <p className="text-xs text-coral/100 max-w-md mx-auto">{fetchError}</p>
      )}
      {fetchError ? (
        <button
          type="button"
          onClick={fetchApplications}
          className="text-xs text-accent underline hover:text-accent-strong mt-1"
        >
          Try again
        </button>
      ) : (
        <button
          type="button"
          onClick={handleResetFilters}
          className="text-xs text-accent underline hover:text-accent-strong"
        >
          Clear search & filters
        </button>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">Career Applications</h1>
          <p className="text-sm text-ink-3 mt-1">
            Review candidates, schedule multi-round interviews, and filter candidate data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchApplications}
            disabled={loading}
            className="p-1.5 text-ink-3 hover:text-ink rounded-md hover:bg-line-soft transition-all text-xs flex items-center gap-1 border border-line disabled:opacity-50"
            title="Refresh list"
          >
            ↻ Refresh
          </button>
          <span className="text-xs font-mono bg-line-soft px-3 py-1.5 rounded-full text-ink-2">
            Showing: {filteredApps.length} / {apps.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <label className="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-1">
              Search Candidate
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, qualification, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-line rounded-sm focus:outline-none focus:border-accent"
              />
              <svg
                className="w-4 h-4 text-ink-3 absolute left-2.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-1">
              Job Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-line rounded-sm focus:outline-none focus:border-accent bg-white"
            >
              <option value="all">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-1">
              Experience
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-line rounded-sm focus:outline-none focus:border-accent bg-white"
            >
              <option value="all">All Experience</option>
              <option value="fresher">Fresher (0 Years)</option>
              <option value="1-3">1 - 3 Years</option>
              <option value="3-5">3 - 5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-1">
              Applied From
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-line rounded-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-line-soft">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-3 font-medium">Stage:</span>
            {statusFilterOptions.map(({ key, label }) => {
              const isSelected = selectedStatus === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedStatus(key)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                    isSelected
                      ? "bg-dark text-ink-inverse "
                      : "bg-line-soft text-ink-2 hover:bg-line"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-coral hover:text-coral font-medium flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="py-20 text-center text-ink-3 text-sm card">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-ink-3 rounded-full mb-2" />
          <p>Loading application data...</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredApps.length === 0 ? (
              <div className="card shadow-sm">
                <EmptyState />
              </div>
            ) : (
              filteredApps.map((app) => {
                const currentRound = getApplicantRound(app);
                const isExpanded = expandedRowId === app.id;

                return (
                  <div
                    key={app.id}
                    className="card shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {app.qualification ? (
                          <span className="block w-fit max-w-full whitespace-normal break-words font-mono-label text-[0.6rem] leading-snug tracking-wide text-accent bg-accent-soft border border-accent/20 px-2 py-0.5 rounded-sm mb-1">
                            {app.qualification}
                          </span>
                        ) : (
                          <span className="block text-[10px] text-ink-3 italic mb-1">
                            No qualification listed
                          </span>
                        )}
                        <div className="font-semibold text-ink leading-tight truncate">
                          {app.candidateName}
                        </div>
                        <div className="text-xs text-ink-3 mt-0.5 truncate">{app.email}</div>
                        <div className="text-xs text-ink-2 mt-1 font-medium">{app.role}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleRowExpand(app.id)}
                        className="p-1 rounded text-ink-3 hover:text-ink-2 hover:bg-line-soft transition-colors shrink-0"
                        title="View details"
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3">
                      <span className="text-[11px] text-ink-3 font-mono">{app.appliedDate}</span>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-strong font-medium underline"
                        >
                          View Resume
                        </a>
                      )}
                    </div>

                    <div className="mt-3">
                      <StatusBadge app={app} />
                      <InterviewDetails app={app} />
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-line-soft">
                        <DetailsGrid app={app} cols="grid-cols-2" />
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-line-soft">
                      <ActionButtons app={app} currentRound={currentRound} wrap />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[880px]">
                <thead className="bg-paper-alt text-ink-2 font-medium border-b border-line">
                  <tr>
                    <th className="px-4 py-4 w-10"></th>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Applied Role</th>
                    <th className="px-6 py-4">Resume</th>
                    <th className="px-6 py-4">Applied Date</th>
                              <th className="w-[180px] px-6 py-4">Status & Details</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const currentRound = getApplicantRound(app);
                      const isExpanded = expandedRowId === app.id;

                      return (
                        <Fragment key={app.id}>
                          <tr className="hover:bg-paper-alt/50 transition-colors">
                            <td className="pl-4 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => toggleRowExpand(app.id)}
                                className="p-1 rounded text-ink-3 hover:text-ink-2 hover:bg-line-soft transition-colors"
                                title="View details"
                              >
                                <svg
                                  className={`w-4 h-4 transform transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </td>

                            <td className="px-6 py-4">
                              {app.qualification ? (
                                <span className="block w-fit max-w-full whitespace-normal break-words font-mono-label text-[0.6rem] leading-snug tracking-wide text-accent bg-accent-soft border border-accent/20 px-2 py-0.5 rounded-sm mb-1">
                                  {app.qualification}
                                </span>
                              ) : (
                                <span className="block text-[10px] text-ink-3 italic mb-1">
                                  No qualification listed
                                </span>
                              )}
                              <div className="font-semibold text-ink leading-tight">
                                {app.candidateName}
                              </div>
                              <div className="text-xs text-ink-3 mt-0.5">{app.email}</div>
                            </td>

                            <td className="px-6 py-4 text-ink-2 font-medium">
                              <div>{app.role}</div>
                              {app.jobExperience && (
                                <div className="mt-1 text-[10px] font-normal text-ink-3">
                                  Exp: {app.jobExperience}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              {app.resumeUrl ? (
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-strong font-medium underline"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                  View Resume
                                </a>
                              ) : (
                                <span className="text-xs text-ink-3">N/A</span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-ink-3 font-mono text-xs">
                              {app.appliedDate}
                            </td>

                            <td className="w-[180px] max-w-[180px] overflow-hidden px-6 py-4 align-top">
                              <StatusBadge app={app} />
                              <InterviewDetails app={app} />
                            </td>

                            <td className="px-6 py-4 text-center">
                              <ActionButtons app={app} currentRound={currentRound} />
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-paper-alt/70 border-b border-line-soft">
                              <td colSpan={7} className="px-8 py-3.5">
                                <DetailsGrid app={app} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Schedule / Reschedule Modal */}
      {activeModalId && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6 shadow-float border border-line max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-ink text-lg mb-1">
              {isRescheduling
                ? `Reschedule Interview — Round ${targetRound}`
                : `Schedule Interview — Round ${targetRound}`}
            </h3>
            <p className="text-xs text-ink-3 mb-5">
              {isRescheduling
                ? "Update interview timing, mode, or coordinates for this round."
                : "Set interview timing and location or video coordinates for this round."}
            </p>

            <form
              onSubmit={(e) => handleScheduleSubmit(e, activeModalId)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1.5">
                  Interview Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleData({ ...scheduleData, mode: "Online" })}
                    className={`py-2 text-xs font-medium rounded-sm border text-center transition-colors ${
                      scheduleData.mode === "Online"
                        ? "border-black bg-black text-white"
                        : "border-line bg-white text-ink-2 hover:bg-paper-alt"
                    }`}
                  >
                    Online (Video Call)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleData({ ...scheduleData, mode: "Offline" })}
                    className={`py-2 text-xs font-medium rounded-sm border text-center transition-colors ${
                      scheduleData.mode === "Offline"
                        ? "border-black bg-black text-white"
                        : "border-line bg-white text-ink-2 hover:bg-paper-alt"
                    }`}
                  >
                    Offline (In-Person)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleData.dateTime}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, dateTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1">
                  {scheduleData.mode === "Online"
                    ? "Meeting Link (Google Meet / Zoom)"
                    : "Office Venue / Floor"}
                </label>
                <input
                  type="text"
                  placeholder={
                    scheduleData.mode === "Online"
                      ? "https://meet.google.com/xyz-abcd-efg"
                      : "Axonite HQ, 4th Floor, Pune Office"
                  }
                  value={scheduleData.locationOrLink}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      locationOrLink: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={schedulingLoading}
                  onClick={() => setActiveModalId(null)}
                  className="px-3 py-2 text-xs text-ink-2 hover:bg-line-soft rounded-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingLoading}
                  className="px-4 py-2 text-xs bg-accent text-white hover:bg-accent-strong rounded-sm font-medium transition-colors disabled:opacity-50"
                >
                  {schedulingLoading
                    ? "Saving..."
                    : isRescheduling
                    ? `Confirm Reschedule`
                    : `Confirm Round ${targetRound}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}