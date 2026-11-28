module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly', module: 'writable', process: 'readonly',
        console: 'readonly', __dirname: 'readonly', fetch: 'readonly',
        AbortSignal: 'readonly'
      },
    },
    rules: { 'no-unused-vars': 'error', 'no-undef': 'error' },
  },
];