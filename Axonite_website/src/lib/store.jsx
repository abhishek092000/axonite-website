import React, { createContext, useContext, useState, useEffect } from "react";
import { blogPosts as defaultBlogPosts, jobs as defaultJobs } from "../data/content";
import {
  API_BASE_URL,
  clearSession,
  fetchProfile,
  getStoredAdmin,
  getToken,
  saveSession,
} from "./api";

const KEYS = {
  blog: "axonite_blog_posts",
  jobs: "axonite_jobs",
  pageviews: "axonite_pageviews",
  sessions: "axonite_sessions",
  breakdown: "axonite_page_breakdown",
  applications: "axonite_applications",
};

// --- Low-level storage utilities ---

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Fail silently when storage is restricted
  }
};

const seedIfEmpty = (key, seedData) => {
  if (localStorage.getItem(key) === null) {
    write(key, seedData);
  }
};

const initStore = () => {
  seedIfEmpty(
    KEYS.blog,
    defaultBlogPosts.map((p, i) => ({ id: `seed-post-${i}`, ...p }))
  );
  seedIfEmpty(
    KEYS.jobs,
    defaultJobs.map((j, i) => ({ id: `seed-job-${i}`, ...j }))
  );
};

if (typeof window !== "undefined") {
  initStore();
}

// --- Live Backend Auth Utilities ---

export const isAuthed = () => {
  if (typeof window === "undefined") return false;
  return Boolean(getToken());
};

export const getAdminUser = () => getStoredAdmin();

/**
 * Confirms the stored token is still accepted by the backend and refreshes
 * the cached admin profile. Returns the admin object when the session is
 * usable, else null.
 *
 * A rejected token (401/403/404) ends the session, but a network or server
 * hiccup must not sign the user out — the cached profile is returned instead.
 */
export const refreshSession = async () => {
  if (!getToken()) return null;

  const { ok, status, data } = await fetchProfile();
  if (ok && data?.admin) {
    saveSession(getToken(), data.admin);
    return data.admin;
  }

  if (status === 401 || status === 403 || status === 404) {
    clearSession();
    return null;
  }

  return getStoredAdmin();
};

export const login = async (identifier, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: identifier.trim(),
        password,
      }),
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(data.error || "Incorrect username or password.");
    }

    saveSession(data.token, data.admin);
    return { success: true, admin: data.admin, token: data.token };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const logout = () => {
  clearSession();
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
};

// --- Blog & Job Storage ---

export const getBlogPosts = () => read(KEYS.blog, []);

export const saveBlogPost = (post) => {
  const posts = getBlogPosts();
  if (post.id) {
    const idx = posts.findIndex((p) => p.id === post.id);
    if (idx >= 0) {
      posts[idx] = post;
      write(KEYS.blog, posts);
      return post;
    }
  }
  const withId = { ...post, id: `post-${Date.now()}` };
  const updated = [withId, ...posts];
  write(KEYS.blog, updated);
  return withId;
};

export const deleteBlogPost = (id) => {
  const filtered = getBlogPosts().filter((p) => p.id !== id);
  write(KEYS.blog, filtered);
};

export const getJobs = () => read(KEYS.jobs, []);

export const saveJob = (job) => {
  const jobs = getJobs();
  if (job.id) {
    const idx = jobs.findIndex((j) => j.id === job.id);
    if (idx >= 0) {
      jobs[idx] = job;
      write(KEYS.jobs, jobs);
      return job;
    }
  }
  const withId = { ...job, id: `job-${Date.now()}` };
  write(KEYS.jobs, [withId, ...jobs]);
  return withId;
};

export const deleteJob = (id) => {
  const filtered = getJobs().filter((j) => j.id !== id);
  write(KEYS.jobs, filtered);
};

// --- Analytics Tracking ---

export const trackPageView = (path) => {
  const total = read(KEYS.pageviews, 0) + 1;
  write(KEYS.pageviews, total);

  const breakdown = read(KEYS.breakdown, {});
  breakdown[path] = (breakdown[path] || 0) + 1;
  write(KEYS.breakdown, breakdown);

  if (!sessionStorage.getItem("axonite_session_counted")) {
    sessionStorage.setItem("axonite_session_counted", "1");
    write(KEYS.sessions, read(KEYS.sessions, 0) + 1);
  }
};

export const getStats = () => ({
  pageviews: read(KEYS.pageviews, 0),
  sessions: read(KEYS.sessions, 0),
  breakdown: read(KEYS.breakdown, {}),
});

// --- Demo Applications Fallback ---

const defaultApplications = [
  {
    id: "app-1",
    qualification: "B.Tech in Computer Science",
    candidateName: "Rohan Sharma",
    email: "rohan.sharma@example.com",
    role: "Frontend Engineer",
    appliedDate: "2026-08-28",
    status: "New",
    interviewDate: null,
    resumeLink: "#",
  },
  {
    id: "app-2",
    qualification: "B.Tech in Computer Science",
    candidateName: "Priya Patel",
    email: "priya.p@example.com",
    role: "Product Designer",
    appliedDate: "2026-08-30",
    status: "New",
    interviewDate: null,
    resumeLink: "#",
  },
];

export const getApplications = () => {
  seedIfEmpty(KEYS.applications, defaultApplications);
  return read(KEYS.applications, defaultApplications);
};

export const updateApplicationStatus = (id, status, interviewDate = null) => {
  const apps = getApplications();
  const updated = apps.map((app) =>
    app.id === id ? { ...app, status, interviewDate } : app
  );
  write(KEYS.applications, updated);
  return updated;
};

// --- React Context Provider ---

const StoreContext = createContext(null);

export const AdminStoreProvider = ({ children }) => {
  const [blogPosts, setBlogPostsState] = useState(getBlogPosts);
  const [jobs, setJobsState] = useState(getJobs);
  const [authenticated, setAuthenticated] = useState(isAuthed);

  useEffect(() => {
    setAuthenticated(isAuthed());
  }, []);

  const handleSavePost = (post) => {
    const saved = saveBlogPost(post);
    setBlogPostsState(getBlogPosts());
    return saved;
  };

  const handleDeletePost = (id) => {
    deleteBlogPost(id);
    setBlogPostsState(getBlogPosts());
  };

  const handleSaveJob = (job) => {
    const saved = saveJob(job);
    setJobsState(getJobs());
    return saved;
  };

  const handleDeleteJob = (id) => {
    deleteJob(id);
    setJobsState(getJobs());
  };

  const handleLogin = async (u, p) => {
    const res = await login(u, p);
    setAuthenticated(res.success);
    return res;
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  return (
    <StoreContext.Provider
      value={{
        blogPosts,
        jobs,
        isAuthenticated: authenticated,
        saveBlogPost: handleSavePost,
        deleteBlogPost: handleDeletePost,
        saveJob: handleSaveJob,
        deleteJob: handleDeleteJob,
        login: handleLogin,
        logout: handleLogout,
        getStats,
        trackPageView,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useAdminStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useAdminStore must be used within an AdminStoreProvider");
  }
  return context;
};