/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a365d',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#d69e2e',
          foreground: '#ffffff',
        },
        background: '#0f172a',
        foreground: '#f8fafc',
        muted: {
          DEFAULT: '#1e293b',
          foreground: '#94a3b8',
        },
        card: {
          DEFAULT: '#1e293b',
          foreground: '#f8fafc',
        },
        border: '#334155',
        input: '#334155',
        ring: '#d69e2e',
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
