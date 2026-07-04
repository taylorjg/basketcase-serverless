import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import vitest from "eslint-plugin-vitest";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", ".serverless/**"],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettier,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...vitest.environments.env.globals,
      },
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
];
