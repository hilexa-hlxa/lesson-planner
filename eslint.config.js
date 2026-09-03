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
  // .claude/ — локальный инструментарий Claude Code, а не код проекта: он в
  // .gitignore, в репозиторий не попадает и в CI его нет. Без этого игнора
  // `npm run lint` падал с 46 ошибками (no-undef на require/__dirname/process
  // в .claude/helpers/*.js) ЛОКАЛЬНО и проходил в CI — то есть проверка
  // говорила разное в двух местах, и локально ей нельзя было пользоваться
  // вообще. Линт должен видеть ровно то, что лежит в репозитории.
  globalIgnores(['dist', 'backend/**', '.claude/**']),
  {
    // admin/ is its own Node/CommonJS service (see admin/README.md), not
    // part of the Vite/React app — excluded here so it doesn't get the
    // browser-globals block below (require/module/process/Buffer aren't
    // browser globals) and gets its own Node-flavored block instead.
    files: ['**/*.{js,jsx}'],
    ignores: ['admin/**'],
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
  {
    files: ['admin/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
])
