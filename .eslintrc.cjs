module.exports = {
    root: true,
    env: { browser: true, es2021: true },
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: ['react', 'react-hooks', 'react-refresh', '@typescript-eslint'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    settings: { react: { version: 'detect' } },
};
