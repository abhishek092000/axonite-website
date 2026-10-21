/** @type {import('tailwindcss').Config} */

// Design tokens mirror the official Axonite design kit.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,astro}"],
  theme: {
    extend: {
      colors: {
        paper: "#fbfaf8",
        "paper-alt": "#f3f1f8",
        white: "#ffffff",
        dark: "#0c0b24",
        "dark-2": "#15133a",
        "dark-3": "#211e52",
        deep: "#1d1258",

        ink: "#15143d",
        "ink-2": "#464466",
        "ink-3": "#6b6989",
        "ink-inverse": "#f4f2fb",
        "ink-inverse-2": "#b4b1d4",

        line: "#e5e2ec",
        "line-soft": "#efedf3",
        "line-dark": "#2b2862",

        accent: "#5b3bd6",
        "accent-strong": "#4527b0",
        "accent-bright": "#a08bff",
        "accent-soft": "#eeeaff",
        "accent-ink": "#251466",

        magenta: "#c248c7",
        "magenta-bright": "#e58ae8",
        blue: "#154ad8",
        cyan: "#26a2e2",
        "cyan-bright": "#5cc8f2",
        gold: "#a9752c",
        "gold-soft": "#f6eddd",
        "gold-ink": "#7a5313",
        "gold-line": "#e7d3b4",
        "gold-wash": "#fdf7ec",
        coral: "#c2543a",
        graphite: "#171d26",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        display: ['"Hanken Grotesk"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
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
