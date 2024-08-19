// @ts-check

import tsPlugin from '@typescript-eslint/eslint-plugin';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,

  // See https://stackoverflow.com/a/64488474/388951
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'], // We use TS config only for TS files
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'], // We use TS config only for TS files
  })),
  {
    files: ['src/**/*.{ts,tsx}'],

    // This is required, see the docs
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    // This is needed in order to specify the desired behavior for its rules
    plugins: {
      '@typescript-eslint': tsPlugin,
    },

    // After defining the plugin, you can use the rules like this
    rules: {
      // Sometimes it's convenient to give the index a name.
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/array-type': 'off', // ['error', {default: "array-simple"}],
    },
  },
);
