import BrandMark from "../../components/BrandMark";

const FEATURES = [
  {
    title: "Publishing",
    body: "Blog posts, careers and applications are managed from one place.",
  },
  {
    title: "Access control",
    body: "The main admin owns the account and issues temporary staff logins.",
  },
  {
    title: "AI knowledge base",
    body: "Upload company documents that power the public site chatbot.",
  },
];

/**
 * Split-screen frame shared by the admin sign-in and password-reset pages.
 *
 * Mobile and tablet get a single centred column; from lg up the same content
 * is paired with a dark brand panel drawn from the product site's palette.
 */
export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="section-dark grain ambient-wash relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between px-10 py-12 xl:px-16 xl:py-14">
        <div className="relative">
          <BrandMark height={44} />
        </div>

        <div className="relative max-w-md xl:max-w-lg">
          <p className="eyebrow mb-5">Admin console</p>
          <h1 className="text-[clamp(1.9rem,1.1rem+2vw,2.6rem)] leading-[1.1] tracking-[-0.02em] text-ink-inverse mb-5">
            One workspace for everything Axonite publishes.
          </h1>
          <p className="text-sm leading-relaxed text-ink-inverse-2">
            Staff tools for the Axonite website — content, hiring and the AI knowledge base.
            Access is restricted to approved accounts.
          </p>

          <ul className="mt-10 space-y-6 border-t border-white/10 pt-8">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-bright"
                />
                <div>
                  <p className="font-mono-label text-[0.68rem] text-teal-50 mb-1">{f.title}</p>
                  <p className="text-[0.82rem] leading-relaxed text-ink-inverse-2">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-ink-inverse-2/70">
          © {new Date().getFullYear()} Axonite Technologies Pvt Ltd
        </p>
      </aside>

      {/* Form column */}
      <main className="flex min-h-screen flex-col lg:min-h-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-10 xl:px-16">
          <div className="mx-auto w-full max-w-[26rem]">
            {/* Dark-text mark for the light surface, matching the public navbar.
                The panel on the left uses the inverse (light) logo instead. */}
            <div className="mb-8 flex justify-center lg:hidden">
              <img
                src="/logo-nav.png"
                alt="Axonite Technology Pvt Ltd"
                width="1051"
                height="253"
                className="h-10 w-auto object-contain sm:h-11"
              />
            </div>

            {children}
          </div>
        </div>

        <footer className="px-6 pb-8 text-center text-xs text-ink-3 lg:pb-10">
          © {new Date().getFullYear()} Axonite Technologies Pvt Ltd · Restricted access
        </footer>
      </main>
    </div>
  );
}

export const fieldLabelClass =
  "font-mono-label text-[0.68rem] text-ink-3 block mb-2";

export const fieldClass =
  "w-full bg-paper border border-line rounded-md px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink-3 transition-colors focus:outline-none focus:border-accent disabled:opacity-60";

export const primaryButtonClass =
  "w-full inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold text-[0.9375rem] px-6 py-3.5 rounded-full transition-colors hover:bg-accent-strong disabled:opacity-60 disabled:cursor-not-allowed";

/**
 * Shared status banner. Renders nothing when there is no message so the
 * form spacing never shifts.
 */
export function StatusMessage({ tone = "error", children }) {
  if (!children) return null;

  const tones = {
    error: "text-coral bg-coral/10 border-coral/30",
    success: "text-accent-strong bg-accent-soft border-accent/20",
    info: "text-ink-2 bg-paper-alt border-line",
  };

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`text-sm rounded-md border px-4 py-3 leading-relaxed ${tones[tone]}`}
    >
      {children}
    </p>
  );
}

/** Inline spinner for button labels while a request is in flight. */
export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}
