import path from "node:path";
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
			"@docusaurus/useDocusaurusContext": path.resolve(
				__dirname,
				"src/__mocks__/useDocusaurusContextMock.ts",
			),
			"@theme/Layout": path.resolve(
				__dirname,
				"src/__mocks__/themeLayoutMock.tsx",
			),
			"@theme/Heading": path.resolve(
				__dirname,
				"src/__mocks__/themeHeadingMock.tsx",
			),
		},
	},
});
