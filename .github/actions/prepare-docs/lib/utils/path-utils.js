"use strict";

const path = require("path");

function normalizeToPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function sanitizeSegment(segment = "") {
  return segment
    .replace(/^[.\s]+/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeRelativePath(relPath) {
  return normalizeToPosix(relPath)
    .split("/")
    .map((segment) => sanitizeSegment(segment))
    .filter(Boolean)
    .join("/");
}

function rewriteReadmeToIndex(relPath) {
  if (!relPath) {
    return relPath;
  }

  const segments = relPath.split("/");
  const lastIndex = segments.length - 1;

  if (lastIndex >= 0 && segments[lastIndex].toLowerCase() === "readme.md") {
    segments[lastIndex] = "index.md";
  }

  return segments.join("/");
}

function didRewriteReadme(originalPath, rewrittenPath) {
  if (!originalPath || !rewrittenPath) {
    return false;
  }

  if (originalPath === rewrittenPath) {
    return false;
  }

  const segments = originalPath.split("/");
  const last = segments[segments.length - 1];
  return Boolean(last && last.toLowerCase() === "readme.md");
}

function sanitizeLinkPath(targetPath) {
  if (!targetPath) {
    return targetPath;
  }

  const normalized = normalizeToPosix(targetPath);
  const hasLeadingSlash = normalized.startsWith("/");
  const hasTrailingSlash = normalized.length > 1 && normalized.endsWith("/");

  const segments = normalized.split("/");
  const sanitizedSegments = [];

  segments.forEach((segment, index) => {
    if (segment === "" && index === 0 && hasLeadingSlash) {
      sanitizedSegments.push("");
      return;
    }

    if (segment === "" && index === segments.length - 1 && hasTrailingSlash) {
      sanitizedSegments.push("");
      return;
    }

    if (segment === "." || segment === "..") {
      sanitizedSegments.push(segment);
      return;
    }

    if (!segment) {
      return;
    }

    const sanitized = sanitizeSegment(segment);
    if (sanitized) {
      sanitizedSegments.push(sanitized);
    }
  });

  let sanitizedPath = sanitizedSegments.join("/");

  if (hasLeadingSlash && !sanitizedPath.startsWith("/")) {
    sanitizedPath = `/${sanitizedPath}`;
  }

  if (hasTrailingSlash && !sanitizedPath.endsWith("/")) {
    sanitizedPath = `${sanitizedPath}/`;
  }

  return rewriteReadmeToIndex(sanitizedPath);
}

function splitLinkPathAndSuffix(target) {
  let cutIndex = -1;
  const hashIndex = target.indexOf("#");
  const queryIndex = target.indexOf("?");

  if (hashIndex !== -1 && queryIndex !== -1) {
    cutIndex = Math.min(hashIndex, queryIndex);
  } else if (hashIndex !== -1) {
    cutIndex = hashIndex;
  } else if (queryIndex !== -1) {
    cutIndex = queryIndex;
  }

  if (cutIndex === -1) {
    return { path: target, suffix: "" };
  }

  return {
    path: target.slice(0, cutIndex),
    suffix: target.slice(cutIndex),
  };
}

function deriveTitleFromReadmePath({ indexPath, sourceRepository }) {
  if (!indexPath) {
    return null;
  }

  const segments = indexPath.split("/");
  if (!segments.length) {
    return null;
  }

  segments.pop();

  while (segments.length) {
    const candidate = segments.pop();
    if (candidate) {
      const formatted = formatTitleFromSlug(candidate);
      if (formatted) {
        return formatted;
      }
    }
  }

  if (sourceRepository) {
    const repoSegments = sourceRepository.split("/");
    const repoSlug = repoSegments[1] || repoSegments[0];
    if (repoSlug) {
      const formatted = formatTitleFromSlug(repoSlug);
      if (formatted) {
        return formatted;
      }
    }
  }

  return "Home";
}

function formatTitleFromSlug(slug) {
  if (!slug) {
    return "";
  }

  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function toSystemPath(root, posixPath) {
  if (!posixPath) {
    return root;
  }

  const segments = posixPath.split("/").filter(Boolean);
  return path.join(root, ...segments);
}

module.exports = {
  normalizeToPosix,
  sanitizeSegment,
  sanitizeRelativePath,
  rewriteReadmeToIndex,
  didRewriteReadme,
  sanitizeLinkPath,
  splitLinkPathAndSuffix,
  deriveTitleFromReadmePath,
  formatTitleFromSlug,
  toSystemPath,
};
