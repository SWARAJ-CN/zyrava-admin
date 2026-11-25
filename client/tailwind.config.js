import { createRequire } from "node:module";
import path from "node:path";
import { heroui } from "@heroui/theme";

const require = createRequire(import.meta.url);
// HeroUI is hoisted to the workspace root in this monorepo, so resolve its
// real folder instead of assuming ./node_modules. Its component styles ship
// as .mjs, which the default content glob would otherwise skip.
const herouiTheme = path.dirname(require.resolve("@heroui/theme/package.json"));

const primary = {
  50: "#f5f3ff",
  100: "#ede9fe",
  200: "#ddd6fe",
  300: "#c4b5fd",
  400: "#a78bfa",
  500: "#8b5cf6",
  600: "#7c3aed",
  700: "#6d28d9",
  800: "#5b21b6",
  900: "#4c1d95",
  DEFAULT: "#8b5cf6",
  foreground: "#ffffff",
};

const secondary = {
  50: "#ecfeff",
  100: "#cffafe",
  200: "#a5f3fc",
  300: "#67e8f9",
  400: "#22d3ee",
  500: "#06b6d4",
  600: "#0891b2",
  700: "#0e7490",
  800: "#155e75",
  900: "#164e63",
  DEFAULT: "#22d3ee",
  foreground: "#06222a",
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    path.join(herouiTheme, "dist/**/*.{js,mjs,cjs,ts,tsx,jsx}"),
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Sora"', '"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 60px -18px rgba(139, 92, 246, 0.55)",
        card: "0 20px 60px -30px rgba(0, 0, 0, 0.65)",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(circle at 20% 0%, rgba(139,92,246,0.15), transparent 34%), radial-gradient(circle at 85% 8%, rgba(34,211,238,0.08), transparent 30%)",
      },
    },
  },
  plugins: [
    heroui({
      defaultTheme: "dark",
      themes: {
        light: {
          colors: {
            primary,
            secondary,
            focus: "#7c3aed",
          },
        },
        dark: {
          colors: {
            primary: {
              ...primary,
              DEFAULT: "#a78bfa",
              foreground: "#0b0714",
            },
            secondary,
            focus: "#a78bfa",
            background: "#07070b",
            content1: "#0f0f16",
            content2: "#14141d",
            content3: "#1b1b26",
            content4: "#232330",
          },
        },
      },
    }),
  ],
};
