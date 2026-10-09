import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "output/**", // Preserved release/QA artifacts contain generated bundles.
    "docs/Operations/security-evidence-2026-10-09/**", // Frozen audit fixtures are evidence, not application source.
    "build/**",
    "next-env.d.ts",
    "legacy/**",
    "new_design/**",
    "Route Planner Pro/**",
  ]),
]);

export default eslintConfig;
