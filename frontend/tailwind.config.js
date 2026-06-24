/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FACE39',
          dark:   '#00000F',
          white:  '#FFFFFF',
        },
        primary: {
          DEFAULT: '#FACE39',
          50:  '#FFFDF0',
          100: '#FFF9D6',
          200: '#FEF0A3',
          300: '#FDE770',
          400: '#FCDC52',
          500: '#FACE39',
          600: '#E8B010',
          700: '#B5890C',
          800: '#836308',
          900: '#503C05',
        },
        dark: {
          DEFAULT: '#00000F',
          50:  '#F0F0F2',
          100: '#D1D1D8',
          200: '#A3A3B1',
          300: '#75758A',
          400: '#474762',
          500: '#1A1A2E',
          600: '#10101F',
          700: '#080812',
          800: '#04040A',
          900: '#00000F',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark:  '#DC2626',
        },
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
          dark:  '#16A34A',
        },
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        body:    ['var(--font-body)'],
      },
      borderRadius: {
        'md':  '10px',
        'lg':  '10px',
        'xl':  '10px',
        '2xl': '10px',
        '3xl': '10px',
      },
      boxShadow: {
        large:  '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        yellow: '0 0 30px rgba(250, 206, 57, 0.35)',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        luminedge: {
          "primary":          "#FACE39",
          "primary-content":  "#00000F",
          "secondary":        "#00000F",
          "secondary-content":"#FFFFFF",
          "accent":           "#FACE39",
          "neutral":          "#1A1A2E",
          "base-100":         "#00000F",
          "base-200":         "#0D0D1F",
          "base-300":         "#1A1A2E",
          "base-content":     "#FFFFFF",
          "info":             "#3ABFF8",
          "success":          "#22C55E",
          "warning":          "#FBBD23",
          "error":            "#EF4444",
        },
      },
    ],
    darkTheme: "luminedge",
  },
}
