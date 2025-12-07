import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], // Apply to all relevant files
    languageOptions: {
      globals: {
        ...globals.browser, // Keep browser globals for client components
        ...globals.node,    // Add Node.js globals (like console)
        React: "readonly", // Define React if needed
      }
    }
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
];

export default eslintConfig;
