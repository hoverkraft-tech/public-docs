import "@testing-library/jest-dom";

class MockIntersectionObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
    takeRecords() {
        return [];
    }
}

if (typeof window !== "undefined") {
    if (!("IntersectionObserver" in window)) {
        // Provide a minimal stub so components using lazy-loading hooks do not crash in tests.
        (window as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    }

    const ensureDocusaurusRuntime = window as Window & {
        docusaurus?: {
            preload: (path?: string) => void;
            prefetch: (path?: string) => void;
        };
    };

    if (!ensureDocusaurusRuntime.docusaurus) {
        ensureDocusaurusRuntime.docusaurus = {
            preload: jest.fn(),
            prefetch: jest.fn(),
        };
    }
}

