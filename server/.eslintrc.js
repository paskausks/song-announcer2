module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'airbnb-base',
        'plugin:jest/recommended'
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'jest'
    ],
    settings: {
        "import/resolver": {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
    rules: {
        indent: ['error', 4],
        '@typescript-eslint/explicit-function-return-type': ['error'],
        'import/no-unresolved': [2, { 'commonjs': true, 'amd': true }],
        'import/extensions': [ 'error', 'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never'
            }
        ],

        // Fix where used interfaces get marked as unused
        // FIXME: This can't stay off forever.
        // Rerun after doing yarn update.
        "no-unused-vars": "off",

        // Rule doesn't apply to args prefixed with _
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
};
