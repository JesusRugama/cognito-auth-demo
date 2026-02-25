/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          'bg-page': 'var(--color-bg-page)',
          'bg-card': 'var(--color-bg-card)',
          'bg-card-alt': 'var(--color-bg-card-alt)',
          'border': 'var(--color-border)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',
          'input-bg': 'var(--color-input-bg)',
          'input-border': 'var(--color-input-border)',
          'input-text': 'var(--color-input-text)',
        },
      },
    },
  },
  plugins: [],
};
