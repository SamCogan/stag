import type { Linter } from "eslint";

export const applicationRules = {
  complexity: ["error", 10],
  curly: ["error", "all"],
  eqeqeq: ["error", "always", { null: "ignore" }],
  "max-depth": ["error", 3],
  "max-lines": [
    "error",
    { max: 300, skipBlankLines: true, skipComments: true },
  ],
  "max-lines-per-function": [
    "error",
    { max: 100, skipBlankLines: true, skipComments: true },
  ],
  "max-nested-callbacks": ["error", 3],
  "max-params": ["error", 4],
  "max-statements": ["error", 40],
  "no-alert": "error",
  "no-console": "error",
  "no-else-return": ["error", { allowElseIf: false }],
  "no-lonely-if": "error",
  "no-param-reassign": "error",
  "no-restricted-syntax": [
    "error",
    {
      selector: "CallExpression[callee.name='eval']",
      message: "Dynamic code evaluation is forbidden.",
    },
    {
      selector: "NewExpression[callee.name='Function']",
      message: "Dynamic function construction is forbidden.",
    },
  ],
  "no-shadow": "off",
  "object-shorthand": ["error", "always"],
  "prefer-const": "error",
  "prefer-object-spread": "error",
  "prefer-template": "error",
  radix: "error",
  "@typescript-eslint/consistent-type-exports": "error",
  "@typescript-eslint/consistent-type-imports": [
    "error",
    { fixStyle: "inline-type-imports", prefer: "type-imports" },
  ],
  "@typescript-eslint/no-shadow": "error",
  "@typescript-eslint/no-unnecessary-condition": [
    "error",
    { allowConstantLoopConditions: "only-allowed-literals" },
  ],
  "import-x/first": "error",
  "import-x/newline-after-import": "error",
  "import-x/no-cycle": "error",
  "import-x/no-duplicates": "error",
  "import-x/order": [
    "error",
    {
      alphabetize: { caseInsensitive: true, order: "asc" },
      groups: [
        "builtin",
        "external",
        "internal",
        ["parent", "sibling", "index"],
        "object",
        "type",
      ],
      "newlines-between": "always",
    },
  ],
  "react/jsx-no-bind": [
    "error",
    { allowArrowFunctions: true, allowFunctions: false, ignoreRefs: false },
  ],
  "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
  "react/no-array-index-key": "error",
  "react/no-danger": "error",
  "react/no-unstable-nested-components": "error",
  "react/prop-types": "off",
  "sonarjs/cognitive-complexity": ["error", 12],
  "unicorn/filename-case": [
    "error",
    { cases: { camelCase: true, pascalCase: true } },
  ],
  "unicorn/no-array-reduce": "off",
  "unicorn/no-null": "off",
  "unicorn/prevent-abbreviations": [
    "error",
    {
      allowList: {
        db: true,
        env: true,
        params: true,
        props: true,
        ref: true,
      },
    },
  ],
} satisfies Linter.RulesRecord;
