/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['"New York"', 'Merriweather', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        handwritten: ['Caveat', '"Architects Daughter"', '"Brush Script MT"', 'cursive'],
      },
      colors: {
        apple: {
          yellow: '#E5A93C',
          orange: '#FF9500',
          tint: '#D4A373',
          border: 'rgba(0, 0, 0, 0.08)',
          darkBorder: 'rgba(255, 255, 255, 0.1)',
          sidebar: '#F6F6F6',
          darkSidebar: '#1E1E1E',
          card: '#FFFFFF',
          darkCard: '#252525',
          bg: '#FBFBFB',
          darkBg: '#181818',
        }
      },
      boxShadow: {
        'apple': '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'apple-floating': '0 10px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
