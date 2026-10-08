/** @type {import('tailwindcss').Config} */

// Design tokens mirror the Axonite product site (Polypus): a warm paper
// canvas, a near-black ink surface, and a single deep-teal accent used
// sparingly for eyebrows, buttons and active states.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        paper: "#faf9f7",
        "paper-alt": "#f2f0eb",
        dark: "#0d1017",
        "dark-2": "#151923",
        "dark-3": "#1e2430",

        // Text
        ink: "#12151c",
        "ink-2": "#3b4250",
        "ink-3": "#6b7284",
        "ink-inverse": "#f4f2ee",
        "ink-inverse-2": "#a9b0bf",

        // Lines
        line: "#e2ded6",
        "line-soft": "#eeeae3",
        "line-dark": "#262d3b",

        // Accent
        accent: "#0f766e",
        "accent-strong": "#0b5a55",
        "accent-bright": "#14b8a6",
        "accent-soft": "#e4f2ef",
        "accent-ink": "#06302d",

        // Secondary accents, used only for small status signals
        gold: "#a9752c",
        "gold-soft": "#f6eddd",
        coral: "#c2543a",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        body: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        serif: ["'Newsreader'", "Georgia", "serif"],
        display: ["'Newsreader'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid display sizes so headings scale without breakpoint juggling.
        display: ["clamp(2.5rem, 1.4rem + 4.4vw, 4.4rem)", { lineHeight: "1.03", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(2rem, 1.3rem + 2.8vw, 3.1rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display-xs": ["clamp(1.5rem, 1.25rem + 1.1vw, 2rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        widest2: "0.28em",
        eyebrow: "0.09em",
        label: "0.12em",
      },
      maxWidth: {
        container: "1180px",
        prose: "820px",
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "16px",
        lg: "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18, 21, 28, 0.04), 0 1px 1px rgba(18, 21, 28, 0.03)",
        raise: "0 2px 4px rgba(18, 21, 28, 0.04), 0 8px 20px -12px rgba(18, 21, 28, 0.14)",
        float: "0 18px 44px -22px rgba(18, 21, 28, 0.28), 0 2px 6px rgba(18, 21, 28, 0.05)",
      },
    },
  },
  plugins: [],
};
