import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@docusaurus/useDocusaurusContext": new URL(
        "src/__mocks__/useDocusaurusContextMock.ts",
        import.meta.url,
      ).pathname,
      "@theme/Layout": new URL(
        "src/__mocks__/themeLayoutMock.tsx",
        import.meta.url,
      ).pathname,
      "@theme/Heading": new URL(
        "src/__mocks__/themeHeadingMock.tsx",
        import.meta.url,
      ).pathname,
    },
  },
});
