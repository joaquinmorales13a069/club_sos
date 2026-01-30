/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#CD2129",
        "primary-dark": "#b01c23",
        "background-light": "#ffffff",
        "background-dark": "#1a1a1a",
        "sos-blue": "#2266A7",
        "sos-gray": "#616161",
      },
      fontFamily: {
        display: ["Code Next", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
}