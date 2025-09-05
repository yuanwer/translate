/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--sm-primary)',
          600: 'var(--sm-primary-600)',
          700: 'var(--sm-primary-700)'
        },
        text: 'var(--sm-text)',
        muted: 'var(--sm-muted)',
        bg: 'var(--sm-bg)',
        surface: 'var(--sm-surface)',
        border: 'var(--sm-border)',
        success: 'var(--sm-success)',
        warning: 'var(--sm-warning)',
        danger: 'var(--sm-danger)',
        info: 'var(--sm-info)'
      },
      borderRadius: {
        xs: 'var(--sm-radius-xs)',
        sm: 'var(--sm-radius-sm)',
        md: 'var(--sm-radius-md)',
        lg: 'var(--sm-radius-lg)'
      },
      boxShadow: {
        sm1: 'var(--sm-shadow-1)',
        sm2: 'var(--sm-shadow-2)'
      }
    }
  },
  plugins: []
}


