import tsParser from '@typescript-eslint/parser'
import hues from './packages/ui/eslint-plugin/index.js'

// Lint for the Vike SPA only (verify:app). Custom filename on purpose:
// a default eslint.config.js would be picked up by the Next.js build.
// Mirrors packages/ui/eslint.config.mjs: raw-value rules on app code,
// relaxed in tests (ruling/URL data), click-handler nav on everywhere.
export default [
  { ignores: ['dist/**', 'node_modules/**', 'packages/**', 'src/**'] },
  {
    files: [
      'routes/**/*.{ts,tsx}',
      'renderer/**/*.{ts,tsx}',
      'server/**/*.ts',
      'content/**/*.{ts,tsx}',
      'scripts/**/*.mjs',
      'vite.config.mts',
      'vitest.app.config.ts',
    ],
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
    files: ['tests/**/*.{ts,tsx}'],
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
]
