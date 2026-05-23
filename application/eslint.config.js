const { FlatCompat } = require("@eslint/eslintrc");
const typescriptParser = require("@typescript-eslint/parser");
const nodePluginModule = require("eslint-plugin-n");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nodePlugin = nodePluginModule.default ?? nodePluginModule;

module.exports = [
  ...compat.extends("plugin:@docusaurus/recommended"),
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      n: nodePlugin,
    },
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
  },
];
