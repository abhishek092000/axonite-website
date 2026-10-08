import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import { logout } from "../lib/store";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/blog", label: "Blog posts" },
  { to: "/admin/careers", label: "Careers" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/knowledge-base", label: "AI Knowledge Base" }, // <-- Added
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  // Prevent background scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  const activeLabel = links.find((l) =>
    l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)
  )?.label;

  const sidebarContent = (
    <>
      <div className="px-6 py-6 border-b border-white/10 shrink-0">
        <BrandMark height={40} />
        <p className="font-mono-label text-[0.62rem] text-teal-100/70 mt-3">Admin panel</p>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-sm text-sm transition-colors ${
                isActive
                  ? "bg-accent-bright text-accent-ink shadow-sm"
                  : "text-teal-50/75 hover:text-white hover:bg-white/10"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="px-4 py-6 border-t border-white/10 space-y-1 shrink-0">
        <a
          href="/"
          className="block px-4 py-2 rounded-sm text-xs text-teal-50/70 hover:text-white hover:bg-white/10"
        >
          View live site ↗
        </a>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 rounded-sm text-sm text-teal-50/70 hover:text-white hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-paper flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-[#123b3a] text-ink-inverse flex-col shrink-0 h-screen sticky top-0 border-r border-[#1b5350] select-none">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          isMobileNavOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMobileNavOpen}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMobileNavOpen(false)}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-[#123b3a] text-ink-inverse flex flex-col border-r border-[#1b5350] select-none transform transition-transform duration-200 ${
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>
      </div>

      {/* Main column */}
      <div className="flex-1 min-w-0 h-screen flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-2.5 border-b border-line bg-paper shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 -ml-2 rounded-sm text-ink hover:bg-black/5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <span className="text-sm font-medium text-ink truncate">
            {activeLabel || "Admin panel"}
          </span>

          <BrandMark compact={true} height={32} />
        </header>

        {/* Scrollable content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}