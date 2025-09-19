// eslint.config.js (flat config)
import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1) Base JS rules
  js.configs.recommended,

  // 2) React rules (flat preset)
  reactPlugin.configs.flat.recommended,

  // 3) Project-specific tweaks
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        // Allow process.env usage in the browser bundle (CRA/webpack replaces it)
        process: "readonly",
      },
    },
    settings: {
      // Remove "React version not specified" warning
      react: { version: "detect" },
    },
    rules: {
      // Optional: for React 17+ new JSX transform
      "react/react-in-jsx-scope": "off",
    },
  },
]);
