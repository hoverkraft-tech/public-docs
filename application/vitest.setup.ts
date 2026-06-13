import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

class MockIntersectionObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords() {
		return [];
	}
}

if (typeof window !== "undefined") {
	if (!("IntersectionObserver" in window)) {
		// Provide a minimal stub so components using lazy-loading hooks do not crash in tests.
		(window as Window & typeof globalThis).IntersectionObserver =
			MockIntersectionObserver as unknown as typeof IntersectionObserver;
	}

	const ensureDocusaurusRuntime = window as Window & {
		docusaurus?: {
			preload: (path?: string) => void;
			prefetch: (path?: string) => void;
		};
	};

	if (!ensureDocusaurusRuntime.docusaurus) {
		ensureDocusaurusRuntime.docusaurus = {
			preload: vi.fn(),
			prefetch: vi.fn(),
		};
	}
}

afterEach(() => {
	vi.clearAllMocks();
});
