"use strict";

const {
  splitLinkPathAndSuffix,
  sanitizeLinkPath,
} = require("../utils/path-utils");
const { resolveAssetPublicPath } = require("../utils/asset-registry");

function normalizeMarkdownBody(content, options = {}) {
  if (!content) {
    return content;
  }

  return rewriteLocalLinks(convertAngleBracketLinks(content), options);
}

function convertAngleBracketLinks(text) {
  if (!text) {
    return text;
  }

  return text.replace(
    /<(https?:\/\/[^>\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})>/g,
    (match, raw) => {
      const isEmail = raw.includes("@");
      const href = isEmail ? `mailto:${raw}` : raw;
      return `[${raw}](${href})`;
    },
  );
}

function rewriteLocalLinks(text, options = {}) {
  if (!text) {
    return text;
  }

  let result = "";
  let index = 0;

  while (index < text.length) {
    const bracketIndex = text.indexOf("[", index);
    if (bracketIndex === -1) {
      result += text.slice(index);
      break;
    }

    result += text.slice(index, bracketIndex);

    let cursor = bracketIndex + 1;
    let nested = 0;
    let bracketEnd = -1;

    while (cursor < text.length) {
      const char = text[cursor];
      if (char === "\\") {
        cursor += 2;
        continue;
      }
      if (char === "[") {
        nested += 1;
      } else if (char === "]") {
        if (nested === 0) {
          bracketEnd = cursor;
          break;
        }
        nested -= 1;
      }
      cursor += 1;
    }

    if (bracketEnd === -1) {
      result += text.slice(bracketIndex);
      break;
    }

    const afterBracket = bracketEnd + 1;

    if (text[afterBracket] !== "(") {
      result += text.slice(bracketIndex, afterBracket);
      index = afterBracket;
      continue;
    }

    let parenCursor = afterBracket + 1;
    let parenDepth = 0;
    let parenEnd = -1;

    while (parenCursor < text.length) {
      const char = text[parenCursor];
      if (char === "\\") {
        parenCursor += 2;
        continue;
      }
      if (char === "(") {
        parenDepth += 1;
      } else if (char === ")") {
        if (parenDepth === 0) {
          parenEnd = parenCursor;
          break;
        }
        parenDepth -= 1;
      }
      parenCursor += 1;
    }

    if (parenEnd === -1) {
      result += text.slice(bracketIndex);
      break;
    }

    const target = text.slice(afterBracket + 1, parenEnd);
    const rewrittenTarget = rewriteLinkTarget(target, options);

    result += text.slice(bracketIndex, afterBracket + 1);
    result += rewrittenTarget;
    result += ")";

    index = parenEnd + 1;
  }

  return rewriteReferenceLinks(result, options);
}

function rewriteReferenceLinks(text, options = {}) {
  const referencePattern = /^(\s*\[[^\]]+\]:\s*)(.+)$/gm;

  return text.replace(referencePattern, (match, prefix, target) => {
    const rewritten = rewriteLinkTarget(target, options);
    if (rewritten === target) {
      return match;
    }
    return `${prefix}${rewritten}`;
  });
}

function rewriteLinkTarget(rawTarget, options = {}) {
  if (!rawTarget) {
    return rawTarget;
  }

  const leadingWhitespaceMatch = rawTarget.match(/^\s+/);
  const leadingWhitespace = leadingWhitespaceMatch
    ? leadingWhitespaceMatch[0]
    : "";
  const trimmedValue = rawTarget.trim();

  if (!trimmedValue) {
    return rawTarget;
  }

  let urlPart = trimmedValue;
  let trailingTitle = "";

  const quoteTitleMatch = trimmedValue.match(/\s+(".*"|'.*')\s*$/);
  if (quoteTitleMatch) {
    trailingTitle = quoteTitleMatch[0];
    urlPart = trimmedValue
      .slice(0, trimmedValue.length - trailingTitle.length)
      .trim();
  } else {
    const parenTitleMatch = trimmedValue.match(/\s+\([^)]*\)\s*$/);
    if (parenTitleMatch) {
      trailingTitle = parenTitleMatch[0];
      urlPart = trimmedValue
        .slice(0, trimmedValue.length - trailingTitle.length)
        .trim();
    }
  }

  if (!urlPart || isExternalLink(urlPart)) {
    return rawTarget;
  }

  const { path: targetPath, suffix } = splitLinkPathAndSuffix(urlPart);
  if (!targetPath) {
    return rawTarget;
  }

  const sanitizedPath = sanitizeLinkPath(targetPath);
  const assetPublicPath = resolveAssetPublicPath({
    assetMap: options.assetMap,
    docRelativePath: options.docRelativePath,
    targetPath: sanitizedPath,
    docsPath: options.docsPath,
    staticPath: options.staticPath,
  });
  const rewrittenPath = assetPublicPath || sanitizedPath;
  const rebuiltTarget = `${rewrittenPath}${suffix}`;

  if (rebuiltTarget === urlPart) {
    return rawTarget;
  }

  return `${leadingWhitespace}${rebuiltTarget}${trailingTitle}`;
}

function isExternalLink(target) {
  const trimmed = target.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith("#")) {
    return true;
  }

  if (trimmed.startsWith("//")) {
    return true;
  }

  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
}

module.exports = {
  normalizeMarkdownBody,
};
