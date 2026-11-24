import tsParser from '@typescript-eslint/parser';
import hues from '../ui/eslint-plugin/index.js';

/**
 * Anti-drift lint, enabled on this package itself. Tests are exempt from the
 * raw-value rules: they assert built byte counts and ruling data.
 */
export default [
  { ignores: ['dist/**', 'node_modules/**', 'sources/**', 'licenses/**'] },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module' },
    plugins: { hues },
    rules: {
      'hues/no-raw-hex': 'error',
      'hues/no-raw-px': 'error',
      'hues/no-anonymous-font-weight': 'error',
      'hues/no-click-handler-nav': 'error',
    },
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: { parser: tsParser, ecmaVersion: 2024, sourceType: 'module' },
    plugins: { hues },
    rules: {
      'hues/no-raw-hex': 'off',
      'hues/no-raw-px': 'off',
      'hues/no-anonymous-font-weight': 'off',
      'hues/no-click-handler-nav': 'error',
    },
  },
];
