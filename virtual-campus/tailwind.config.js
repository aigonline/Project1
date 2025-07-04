module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // This enables dark mode with class-based approach
  theme: {
    extend: {
      colors: {
        primary: '#5D5CDE', 
        primaryLight: '#7C7BF1',
        primaryDark: '#4847A9',
        secondary: '#38B2AC',
        // Add other custom colors as needed
        gray: {
          750: '#323238', // A dark gray between gray-700 and gray-800
        }
      },
      // Other theme extensions
    },
  },
  plugins: [],
}