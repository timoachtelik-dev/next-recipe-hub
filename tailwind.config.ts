// Tailwind CSS v4 configuration
export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Custom color utilities - ensure these are always included
    {
      pattern: /^(bg|text|border|ring)-(primary|secondary|destructive|outline|link|cornsilk|papaya-whip|tea-green|beige|buff)(-hover)?$/,
    },
  ],
};
