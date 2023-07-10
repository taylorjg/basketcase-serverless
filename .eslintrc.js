module.exports = {
  env: { node: true, es2020: true, "vitest-globals/env": true },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:prettier/recommended",
    "plugin:vitest/recommended",
    "plugin:vitest-globals/recommended",
  ],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
};
