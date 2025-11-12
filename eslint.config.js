// eslint.config.js
import nextPlugin from "eslint-config-next";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Config dasar dari ESLint dan TypeScript
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Config bawaan Next.js (sudah termasuk react, react-hooks, jsx-a11y)
  ...nextPlugin,

  // Custom rules tambahan
  {
    rules: {
      "no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
