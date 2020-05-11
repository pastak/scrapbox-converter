module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
      ],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    ignorePatterns: ['*.d.ts']
};
