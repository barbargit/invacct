// eslint.config.js
import nextPlugin from "eslint-config-next";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Config dasar dari ESLint dan TypeScript
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Config bawaan Next.js
  ...nextPlugin,

  // React hooks dan accessibility plugin
  {
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
    },
  },

  // Custom rules tambahan (optional)
  {
    rules: {
      "no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];