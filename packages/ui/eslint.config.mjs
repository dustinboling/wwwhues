import tsParser from '@typescript-eslint/parser';
import hues from './eslint-plugin/index.js';

/**
 * Anti-drift lint, enabled on this package itself (flat config, ESLint 10).
 * Tests and visual specs hold ruling data and are exempt from the raw-value
 * rules; the click-handler rule stays on everywhere.
 */
export default [
  { ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'] },
  {
    files: ['src/**/*.{ts,tsx}', 'scripts/**/*.mjs', 'eslint-plugin/**/*.js'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { hues },
    rules: {
      'hues/no-raw-hex': 'error',
      'hues/no-raw-px': 'error',
      'hues/no-anonymous-font-weight': 'error',
      'hues/no-click-handler-nav': 'error',
    },
  },
  {
    files: ['test/**/*.{ts,tsx}', 'playwright/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { hues },
    rules: {
      'hues/no-raw-hex': 'off',
      'hues/no-raw-px': 'off',
      'hues/no-anonymous-font-weight': 'off',
      'hues/no-click-handler-nav': 'error',
    },
  },
];
