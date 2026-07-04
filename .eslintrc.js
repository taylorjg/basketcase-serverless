const vitest = require("eslint-plugin-vitest");

module.exports = {
  env: { node: true, es2020: true, "vitest/env": true },
  plugins: ["vitest"],
  extends: ["eslint:recommended", "prettier", "plugin:prettier/recommended"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: vitest.configs.recommended.rules,
};
