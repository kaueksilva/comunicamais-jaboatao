import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        foreground: "var(--fg)",
        muted: "var(--muted)",
        border: "var(--border-color)",
        brand: {
          // ── Identidade Visual Oficial Jaboatão dos Guararapes ────────
          blue:      "#0037C1",  // Azul Principal (Identidade)
          blueDark:  "#004797",  // Azul Secundário/Texto
          blueLight: "#00BDFF",  // Azul Destaque/Ação
          "blue-text": "var(--brand-blue-text)", // Tema-aware (Azul no claro, Branco no escuro)
          gold:      "#FDC300",  // Dourado/Amarelo (Coração/Header)
          green:     "#00A859",  // Verde Real (Coração/Natureza)
          red:       "#C1121F",  // Vermelho Alerta/Institucional
          white:     "#F8F9FC",
          black:     "#0D0D0D",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
      },
      boxShadow: {
        "brutal-sm": "3px 3px 0 0",
        "brutal-md": "5px 5px 0 0",
        "brutal-lg": "8px 8px 0 0",
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};
export default config;
