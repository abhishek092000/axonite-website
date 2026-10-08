import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/career", label: "Career" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer on navigation, so the new page isn't hidden behind it.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-paper/[0.88] backdrop-blur-md transition-shadow duration-200 border-b ${
        scrolled || open ? "border-line shadow-[0_12px_28px_-26px_rgba(18,21,28,0.3)]" : "border-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="max-w-container mx-auto flex items-center justify-between gap-4 px-6 h-[76px]"
      >
        <NavLink
          to="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="Axonite Technology Pvt Ltd — home"
        >
          <img
            src="/logo-nav.png"
            alt="Axonite Technology Pvt Ltd"
            width="1051"
            height="253"
            className="h-8 md:h-9 w-auto object-contain"
          />
        </NavLink>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `inline-block px-3.5 py-2 rounded-full text-[0.9375rem] font-medium transition-colors ${
                    isActive
                      ? "text-accent font-semibold"
                      : "text-ink-2 hover:text-ink hover:bg-paper-alt"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-5">
          <a
            href="tel:+919823103626"
            className="text-[0.9rem] text-ink-2 hover:text-ink transition-colors"
          >
            +91 98231 03626
          </a>
          <NavLink
            to="/contact"
            className="inline-flex items-center justify-center bg-accent text-white text-[0.9rem] font-semibold px-5 py-2.5 rounded-full transition-colors hover:bg-accent-strong"
          >
            Start a project
          </NavLink>
        </div>

        <button
          type="button"
          className="lg:hidden -mr-2 w-11 h-11 inline-flex items-center justify-center rounded-sm border border-line bg-white text-ink"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={`lg:hidden bg-paper border-t border-line px-6 py-5 flex-col gap-1 ${
          open ? "flex" : "hidden"
        }`}
      >
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `px-3 py-2.5 rounded-full text-[0.9375rem] font-medium ${
                isActive ? "text-accent font-semibold bg-accent-soft" : "text-ink-2 hover:bg-paper-alt"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <NavLink
          to="/contact"
          onClick={() => setOpen(false)}
          className="inline-flex justify-center bg-accent text-white font-semibold text-[0.9rem] px-4 py-3 rounded-full mt-2"
        >
          Start a project
        </NavLink>
      </div>
    </header>
  );
}
