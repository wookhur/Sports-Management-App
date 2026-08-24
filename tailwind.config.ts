import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Taken from the logo, which had already decided: the brand mark is
        // five green stripes, while this token used to be Tailwind's default
        // blue. Nothing in the product agreed with the mark on its own colour.
        // green-700 rather than a brighter green because `bg-brand text-white`
        // is used for primary buttons — green-600 on white is 3.1:1 and fails
        // AA, green-700 clears it.
        brand: {
          DEFAULT: "#15803d",
          dark: "#14532d",
        },
      },
      fontFamily: {
        // Barlow was already in the product, loaded by the sign-up wizard and
        // nowhere else; the rest of the app ran on the system stack and so had
        // no typographic identity at all. Condensed for headlines, regular for
        // text — the pairing athletic brands use, and the one the wizard set.
        sans: ["Barlow", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Barlow Condensed", "Barlow", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
