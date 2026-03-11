import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          50: "#FFF4EE",
          100: "#FFE4D5",
          200: "#FFC9AB",
          300: "#FFA876",
          400: "#FF8A55",
          500: "#FF6B35",
          600: "#E55A25",
          700: "#CC4A18",
          800: "#993710",
          900: "#66250A",
        },
        secondary: {
          DEFAULT: "#1B4965",
          50: "#E8F0F5",
          100: "#C5D9E6",
          200: "#8FB4CC",
          300: "#5A8EB3",
          400: "#2F6D8F",
          500: "#1B4965",
          600: "#163D55",
          700: "#113145",
          800: "#0C2435",
          900: "#081825",
        },
        success: "#2D6A4F",
        warning: "#E9C46A",
        background: "#FAFAF8",
        card: "#FFFFFF",
        text: "#1A1A1A",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(27,73,101,0.06), 0 4px 12px rgba(27,73,101,0.04)",
        "card-hover": "0 4px 12px rgba(27,73,101,0.10), 0 8px 24px rgba(27,73,101,0.06)",
        "elevated": "0 8px 32px rgba(27,73,101,0.12), 0 2px 8px rgba(27,73,101,0.06)",
        "glow-orange": "0 0 24px rgba(255,107,53,0.15)",
      },
      animation: {
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 0.6s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSubtle: {
          "0%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-6px)" },
          "60%": { transform: "translateY(-3px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
