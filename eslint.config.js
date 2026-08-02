import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },{
    // blogs/ has its own flat config; .copilot and .codex hold vendored bundles
    // and session logs that are megabytes of generated JS (they OOM the linter).
    ignores: ['dist/**', 'node_modules/**', 'blogs/**', '.copilot/**', '.codex/**'],
  },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  // SFCs need the TS parser for their <script lang="ts"> blocks: vue-eslint-parser
  // handles the template and hands the script off to typescript-eslint.
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  // Build/tooling configs run in Node and are allowed CommonJS interop.
  {
    files: ["*.config.js", "*.config.ts", "scripts/**/*.js"],
    languageOptions: { globals: globals.node },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
