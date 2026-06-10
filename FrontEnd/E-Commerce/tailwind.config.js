/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    screens: {
      sm: "540px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Màu từ theme.json của bigspring
        primary: "#0aa8a7",
        secondary: "#0aa8a7",
        dark: "#222",
        text: "#777",
        light: "#999",
        border: "#e9e9e9",
        body: "#fff",
        "theme-light": "#edf6f5",
      },
      fontFamily: {
        primary: ["Lato", "sans-serif"],
      },
      fontSize: {
        h1: "2.441rem",
        "h1-sm": "1.953rem",
        h2: "1.953rem",
        "h2-sm": "1.563rem",
        h3: "1.563rem",
        "h3-sm": "1.25rem",
        h4: "1.25rem",
        h5: "1rem",
        h6: "0.8rem",
      },
    },
  },
  plugins: [],
};
