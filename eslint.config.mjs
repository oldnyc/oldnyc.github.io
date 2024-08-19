// @ts-check

import tsPlugin from '@typescript-eslint/eslint-plugin';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,

  // See https://stackoverflow.com/a/64488474/388951
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.ts'], // We use TS config only for TS files
  })),
  {
    files: ['**/*.ts'],

    // This is required, see the docs
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      },
    },

    // This is needed in order to specify the desired behavior for its rules
    plugins: {
      '@typescript-eslint': tsPlugin,
    },

    // After defining the plugin, you can use the rules like this
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
    }
  }
);
