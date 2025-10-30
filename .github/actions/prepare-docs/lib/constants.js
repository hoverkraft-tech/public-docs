"use strict";

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const DEFAULT_INDEX_FILE = "_index.md";
const FRONTMATTER_HEADER = "---\n";
const FRONTMATTER_FOOTER = "\n---\n";
const STATIC_DIRECTORY = "static";
const STATIC_ASSET_PREFIX = "assets";

module.exports = {
  MARKDOWN_EXTENSIONS,
  DEFAULT_INDEX_FILE,
  FRONTMATTER_HEADER,
  FRONTMATTER_FOOTER,
  STATIC_DIRECTORY,
  STATIC_ASSET_PREFIX,
};
