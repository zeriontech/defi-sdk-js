/* eslint-env node */
module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".js", ".jsx", ".ts", ".tsx"],
    },
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
  env: {
    browser: true,
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "no-unused-vars": "off", // checked by TypeScript's 'noUnusedLocals'
        "react/prop-types": "off", // Use TypeScript types and interfaces instead
      },
    },
    {
      files: ["*.test.{js,ts,tsx}", "test.{js,ts,tsx}"],
      env: { jest: true },
    },
  ],
};
