module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors from design system
        primary: {
          purple: '#6C5DD3',
          'purple-light': '#CFC8FF',
        },
        // Semantic colors
        semantic: {
          pink: '#FFA2C0',
          yellow: '#FFCE73',
          blue: '#A0D7E7',
        },
        // Neutral colors
        neutral: {
          dark: '#262A34',
          medium: '#5E6272',
          light: '#808191',
        },
        // Legacy support
        pastelblue: '#BFDBFE',
        pastelgreen: '#A7F3D0',
        pastelpink: '#FBCFE8'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    }
  },
  plugins: [],
}


