module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["n"],
  extends: ["plugin:@docusaurus/recommended"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "n/no-missing-import": [
      "error",
      {
        tryExtensions: [".js", ".jsx", ".ts", ".tsx"],
        allowModules: [
          "@docusaurus/useDocusaurusContext",
          "@theme/Heading",
          "@theme/Layout",
        ],
      },
    ],
  },
};
