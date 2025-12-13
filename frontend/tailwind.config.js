/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#d4af37",
                bgDark: "#0e1117",
                cardBg: "#1e222b",
                available: "#4caf50",
                banned: "#f44336",
                selected: "#2196f3"
            },
            fontFamily: {
                outfit: ['"Outfit"', "sans-serif"],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'pulse-gold': 'pulse-gold 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'pulse-gold': {
                    '0%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
                }
            }
        },
    },
    plugins: [],
}
