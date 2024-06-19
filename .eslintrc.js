module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:react-hooks/recommended",
        "plugin:prettier/recommended"
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: "module",
    },
    plugins: [
        "react",
        "jsx-a11y",
        "import",
        "react-hooks",
        "prettier"
    ],
    rules: {
        "prettier/prettier": "error",
        "react/react-in-jsx-scope": "off", g
        "import/order": ["error", {
            "groups": ["builtin", "external", "internal"],
            "newlines-between": "always"
        }],
        "react/prop-types": "off", 
        
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};
