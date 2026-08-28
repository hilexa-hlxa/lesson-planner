import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // backend/ is all PHP — its only .js file is a vendored Composer
  // dependency's doc asset (phpoffice/math's mathjax.js), which was getting
  // swept in and failing lint on undefined browser globals it never
  // declares (it's not ours to fix). node_modules is ignored by ESLint's
  // flat-config default; backend/vendor has no equivalent default.
  globalIgnores(['dist', 'backend/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { react },
    rules: {
      // Без этого no-unused-vars не видит использование в JSX и ругается на
      // импорты вроде `motion` (<motion.div/>), хотя они нужны. Остальные
      // правила плагина не включаем — только учёт использования.
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        // Необязательные аргументы catch: `catch {}` поддерживается не везде,
        // а имя ошибки часто не нужно
        caughtErrors: 'none',
      }],
    },
  },
])
