import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: ['node_modules/**', 'logs/**', 'data/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off', // Allow console in backend
      'prettier/prettier': 'error',
    },
  },
  prettier, // Must be last
];
