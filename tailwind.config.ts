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
        primary: "#FF6B35",
        secondary: "#1B4965",
        success: "#2D6A4F",
        warning: "#E9C46A",
        background: "#F8F9FA",
        card: "#FFFFFF",
        text: "#212529",
      },
    },
  },
  plugins: [],
};

export default config;
