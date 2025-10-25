/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // We can extend default Tailwind theme if needed
      colors: {
        'ds-primary': '#2563eb',
        'ds-success': '#16a34a',
      },
    },
  },
  plugins: [],
};

export default config;
