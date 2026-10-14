import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: { extend: { colors: { neon: { cyan: '#22d3ee', magenta: '#e879f9' } } } },
  plugins: [],
};
export default config;
