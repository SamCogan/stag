import { defineConfig, globalIgnores } from "eslint/config";
import type { Linter } from "eslint";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import betterTailwind from "eslint-plugin-better-tailwindcss";
import { flatConfigs as importXFlatConfigs } from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import jestDom from "eslint-plugin-jest-dom";
import jsxA11y from "eslint-plugin-jsx-a11y";
import promise from "eslint-plugin-promise";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import sonarjs, { configs as sonarConfigs } from "eslint-plugin-sonarjs";
import testingLibrary from "eslint-plugin-testing-library";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import { configs as typescriptEslintConfigs } from "typescript-eslint";

import { applicationRules } from "./config/eslintRules";

const requireConfig = <Config>(
  config: Config | undefined,
  name: string,
): Config => {
  if (config === undefined) {
    throw new Error(`${name} configuration is unavailable`);
  }

  return config;
};

const isFlatConfig = (config: unknown): config is Linter.Config =>
  typeof config === "object" && config !== null && !Array.isArray(config);

const requireFlatConfig = (config: unknown, name: string): Linter.Config => {
  if (!isFlatConfig(config)) {
    throw new Error(`${name} flat configuration is unavailable`);
  }

  return config;
};

const reactRecommended = requireConfig(
  react.configs.flat["recommended"],
  "React recommended",
);
const reactJsxRuntime = requireConfig(
  react.configs.flat["jsx-runtime"],
  "React JSX runtime",
);
const sonarRecommended = requireFlatConfig(
  sonarConfigs.recommended,
  "SonarJS recommended",
);

export default defineConfig([
  globalIgnores(["coverage", "dist", "node_modules"]),
  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      betterTailwind.configs["recommended-error"],
      typescriptEslintConfigs.strictTypeChecked,
      typescriptEslintConfigs.stylisticTypeChecked,
      reactRecommended,
      reactJsxRuntime,
      reactHooks.configs.flat["recommended-latest"],
      reactRefreshPlugin.configs.vite,
      jsxA11y.flatConfigs.strict,
      importXFlatConfigs.recommended,
      importXFlatConfigs.typescript,
      promise.configs["flat/recommended"],
      unicorn.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/index.css",
        tsconfig: "tsconfig.app.json",
      },
      "import-x/core-modules": ["bun:test"],
      "import-x/resolver": {
        typescript: true,
      },
      react: {
        version: "detect",
      },
    },
    plugins: {
      sonarjs,
    },
    rules: {
      ...sonarRecommended.rules,
      ...applicationRules,
    },
  },
  {
    files: ["src/App.tsx"],
    rules: {
      complexity: "off",
      "better-tailwindcss/no-unknown-classes": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "sonarjs/cognitive-complexity": "off",
    },
  },
  {
    files: ["src/viteEnv.d.ts"],
    rules: {
      "unicorn/prevent-abbreviations": "off",
    },
  },
  {
    files: ["src/**/*.test.{ts,tsx}", "src/test/**/*.ts"],
    extends: [
      jest.configs["flat/recommended"],
      jest.configs["flat/style"],
      testingLibrary.configs["flat/react"],
      jestDom.configs["flat/recommended"],
    ],
    settings: {
      jest: {
        version: 29,
      },
    },
    rules: {
      "max-lines": [
        "error",
        { max: 350, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 120, skipBlankLines: true, skipComments: true },
      ],
      "max-statements": ["error", 60],
    },
  },
  {
    files: ["src/test/setup.ts"],
    rules: {
      "testing-library/no-manual-cleanup": "off",
    },
  },
  {
    files: ["*.config.ts", "eslint.config.ts"],
    extends: [
      js.configs.recommended,
      typescriptEslintConfigs.strictTypeChecked,
      typescriptEslintConfigs.stylisticTypeChecked,
      importXFlatConfigs.recommended,
      importXFlatConfigs.typescript,
      unicorn.configs.recommended,
    ],
    languageOptions: {
      globals: globals.builtin,
      parserOptions: {
        allowDefaultProject: ["*.config.ts", "eslint.config.ts"],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-console": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "unicorn/filename-case": "off",
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
  {
    files: ["public/sw.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.serviceworker,
    },
    rules: {
      "no-console": "error",
    },
  },
  prettierConfig,
]);
