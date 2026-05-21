// Flat config (ESLint 9) using Expo's shared config + Prettier integration.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'coverage/*'],
  },
  {
    rules: {
      'prettier/prettier': 'warn',
    },
  },
]);
