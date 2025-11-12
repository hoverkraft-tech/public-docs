const React = require("react");

const passthroughProvider = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

const baseExports: Record<string, unknown> = {
    __esModule: true,
    filterDocCardListItems: (items: unknown[] = []) => items,
    useDocsContextualSearchTags: () => [],
    getDocsVersionSearchTag: () => "stable",
};

const docsProxy = new Proxy(baseExports, {
    get(target, prop: string) {
        if (prop in target) {
            return target[prop];
        }

        if (prop === "DocsPreferredVersionContextProvider" || prop.endsWith("Provider")) {
            return passthroughProvider;
        }

        if (prop.startsWith("use")) {
            return () => undefined;
        }

        return () => undefined;
    },
});

module.exports = docsProxy;
