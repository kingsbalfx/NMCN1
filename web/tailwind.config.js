module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 30px rgba(59, 130, 246, 0.22)',
      },
      backgroundImage: {
        'hero-glass': 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(34, 211, 238, 0.16), transparent 24%)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
