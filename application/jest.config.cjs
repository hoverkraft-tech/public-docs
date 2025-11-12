/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(@docusaurus|@hoverkraft)/)"],
  moduleNameMapper: {
    "^@theme/Error$":
      "<rootDir>/node_modules/@docusaurus/core/lib/client/theme-fallback/Error/index.js",
    "^@theme/(.*)$":
      "<rootDir>/node_modules/@docusaurus/theme-classic/lib/theme/$1",
    "^@docusaurus/((?:use)?[A-Z][A-Za-z]+|is[A-Z][A-Za-z]+|[a-z]+[A-Z][A-Za-z]+)$":
      "<rootDir>/node_modules/@docusaurus/core/lib/client/exports/$1.js",
    "^@docusaurus/router$":
      "<rootDir>/node_modules/@docusaurus/core/lib/client/exports/router.js",
    "^@docusaurus/constants$":
      "<rootDir>/node_modules/@docusaurus/core/lib/client/exports/constants.js",
    "^@generated/site-storage$": "<rootDir>/src/__mocks__/siteStorageMock.ts",
    "^@generated/docusaurus.config$":
      "<rootDir>/src/__mocks__/docusaurusConfigMock.ts",
    "^@generated/globalData$": "<rootDir>/src/__mocks__/globalDataMock.ts",
    "^@generated/i18n$": "<rootDir>/src/__mocks__/i18nMock.ts",
    "^@generated/codeTranslations$":
      "<rootDir>/src/__mocks__/codeTranslationsMock.ts",
    "^@generated/site-metadata$": "<rootDir>/src/__mocks__/siteMetadataMock.ts",
    "^@generated/routes$": "<rootDir>/src/__mocks__/routesMock.ts",
    "^@docusaurus/plugin-content-docs/client$":
      "<rootDir>/src/__mocks__/pluginContentDocsClient.ts",
    "^.+\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^.+\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/src/__mocks__/fileMock.ts",
  },
};
