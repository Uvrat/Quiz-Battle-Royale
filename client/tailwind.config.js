/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        // Light mode colors
        primary: '#3B82F6', // blue-500
        secondary: '#F59E0B', // amber-500
        background: '#F3F4F6', // gray-100
        textColor: '#111827', // gray-900
        cardBg: '#FFFFFF',
        subText: '#6B7280', // gray-500
        borderColor: '#E5E7EB', // gray-200
        
        // Dark mode colors (registered as top-level colors for easier use)
        'dark-primary': '#1E40AF', // Changed to blue-800 (darker blue instead of blue-400)
        'dark-secondary': '#FBBF24', // amber-400
        'dark-background': '#000000', // Changed to pure black
        'dark-textColor': '#F9FAFB', // gray-50
        'dark-cardBg': '#000000', // black instead of gray-700
        'dark-subText': '#D1D5DB', // gray-300
        'dark-borderColor': '#4B5563', // gray-600
      },
      animation: {
        'shimmer': 'shimmer 3s infinite linear',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '0 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
      boxShadow: {
        'white-sm': '0 1px 2px 0 rgba(255, 255, 255, 0.05)',
        'white': '0 1px 3px 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(255, 255, 255, 0.06)',
        'white-md': '0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06)',
        'white-lg': '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)',
        'white-xl': '0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.04)',
      }
    },
  },
  plugins: [],
} 