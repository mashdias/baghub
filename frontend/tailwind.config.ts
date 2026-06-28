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
          DEFAULT: "#8D1B55", // Using the vibrant purple/magenta from the logo
          light: "#B82C73",
          dark: "#66133C",
        },
        secondary: {
          DEFAULT: "#1F2937",
          light: "#374151",
        },
        background: "#F9FAFB",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        heading: ["var(--font-outfit)"],
      },
    },
  },
  plugins: [],
};
export default config;
