import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

// Shared lint rules for the Node packages (apps/api, packages/shared).
// apps/web has its own config because Next.js brings its own rules.
export default tseslint.config(
  { ignores: ["**/dist/**", "**/coverage/**", "apps/web/**", "services/**"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: { globals: globals.node },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
);
