"use strict";

const fs = require("fs");
const path = require("path");
const {
  normalizeToPosix,
  sanitizeSegment,
  rewriteReadmeToIndex,
} = require("../utils/path-utils");
const { MARKDOWN_EXTENSIONS, STATIC_ASSET_PREFIX } = require("../constants");

class AssetRewriter {
  constructor({ assetMap, docRelativePath, docsPath, staticPath } = {}) {
    this.assetMap = assetMap;
    this.docRelativePath = docRelativePath;
    this.docsPath = docsPath;
    this.staticPath = staticPath;
  }

  rewrite(value) {
    if (!value || isExternal(value)) {
      return { value, changed: false };
    }

    const { path: targetPath, suffix } = splitLinkPathAndSuffix(value);
    if (!targetPath) {
      return { value, changed: false };
    }

    const sanitizedPath = sanitizeLinkPath(targetPath);
    if (!sanitizedPath) {
      return { value, changed: false };
    }

    const assetCandidate = looksLikeAssetTarget(sanitizedPath);
    const normalizedAssetTarget = assetCandidate
      ? normalizeAssetLinkTarget(this.docRelativePath, sanitizedPath)
      : null;

    const assetPublicPath = resolveAssetPublicPath({
      assetMap: this.assetMap,
      docRelativePath: this.docRelativePath,
      targetPath: sanitizedPath,
      docsPath: this.docsPath,
      staticPath: this.staticPath,
    });

    let effectiveAssetPath = assetPublicPath;

    if (!effectiveAssetPath && assetCandidate) {
      effectiveAssetPath = resolveExistingAssetPublicPath({
        sanitizedPath,
        normalizedAssetTarget,
        docRelativePath: this.docRelativePath,
        docsPath: this.docsPath,
        staticPath: this.staticPath,
      });
    }

    if (
      shouldThrowForMissingAsset({
        assetCandidate,
        assetPublicPath: effectiveAssetPath,
      })
    ) {
      throw createMissingAssetError({
        docRelativePath: this.docRelativePath,
        normalizedAssetTarget,
        originalTarget: value,
        sanitizedPath,
      });
    }

    const rewrittenPath = effectiveAssetPath || sanitizedPath;
    const rebuiltTarget = `${rewrittenPath}${suffix}`;

    return {
      value: rebuiltTarget,
      changed: rebuiltTarget !== value,
    };
  }
}

function isExternal(target) {
  const trimmed = target?.trim();
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

function resolveAssetPublicPath({
  assetMap,
  docRelativePath,
  targetPath,
  docsPath,
  staticPath,
}) {
  if (!assetMap || assetMap.size === 0) {
    return null;
  }

  const normalizedTarget = normalizeAssetLinkTarget(
    docRelativePath,
    targetPath,
  );
  if (!normalizedTarget) {
    return null;
  }

  const registration = assetMap.get(normalizedTarget);
  if (!registration) {
    return null;
  }

  const namespacedAssetPath = deriveStaticPublicPath({
    staticPath,
    storageRelativePath: registration.storageRelativePath,
  });

  if (namespacedAssetPath) {
    return namespacedAssetPath;
  }

  const relativePath = deriveRelativeAssetPath({
    docRelativePath,
    docsPath,
    staticPath,
    storageRelativePath: registration.storageRelativePath,
  });

  if (relativePath) {
    return relativePath;
  }

  return registration.publicPath || null;
}

function normalizeAssetLinkTarget(docRelativePath, targetPath) {
  if (!targetPath) {
    return null;
  }

  const trimmed = targetPath.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return trimmed.replace(/^\/+/, "");
  }

  const basePath = docRelativePath ? path.posix.dirname(docRelativePath) : "";
  const effectiveBase = basePath && basePath !== "." ? basePath : "";
  const combined = effectiveBase ? `${effectiveBase}/${trimmed}` : trimmed;
  let normalized = path.posix.normalize(combined);

  if (!normalized || normalized === "." || normalized === "..") {
    return null;
  }

  if (normalized.startsWith("../")) {
    return null;
  }

  return normalized.replace(/^\.\//, "");
}

function deriveStaticPublicPath({ staticPath, storageRelativePath }) {
  if (!staticPath || !storageRelativePath) {
    return null;
  }

  const normalizedStaticRoot = normalizeToPosix(staticPath);
  const normalizedStorage = normalizeToPosix(storageRelativePath);

  if (!normalizedStaticRoot || !normalizedStorage) {
    return null;
  }

  const namespace = extractStaticNamespace(normalizedStaticRoot);

  const combinedPath = namespace
    ? path.posix.join(namespace, normalizedStorage)
    : normalizedStorage;

  if (!combinedPath) {
    return null;
  }

  return `/${combinedPath}`.replace(/\/+/g, "/");
}

function deriveRelativeAssetPath({
  docRelativePath,
  docsPath,
  staticPath,
  storageRelativePath,
}) {
  if (!docsPath || !staticPath || !storageRelativePath) {
    return null;
  }

  const normalizedDocsRoot = normalizeToPosix(docsPath);
  const normalizedStaticRoot = normalizeToPosix(staticPath);

  if (!normalizedDocsRoot || !normalizedStaticRoot) {
    return null;
  }

  const normalizedDocRelative = docRelativePath
    ? normalizeToPosix(docRelativePath)
    : "";

  const docFullPath = normalizedDocRelative
    ? path.posix.join(normalizedDocsRoot, normalizedDocRelative)
    : normalizedDocsRoot;

  const docDirectory = normalizedDocRelative
    ? path.posix.dirname(docFullPath)
    : normalizedDocsRoot;
  const effectiveDocDirectory =
    docDirectory && docDirectory !== "." ? docDirectory : normalizedDocsRoot;

  const assetFullPath = path.posix.join(
    normalizedStaticRoot,
    normalizeToPosix(storageRelativePath),
  );

  const relativePath = path.posix.relative(
    effectiveDocDirectory,
    assetFullPath,
  );

  if (!relativePath) {
    return null;
  }

  return relativePath.replace(/\\/g, "/");
}

function extractStaticNamespace(staticRoot) {
  if (!staticRoot) {
    return null;
  }

  const segments = staticRoot.split("/").filter(Boolean);
  if (!segments.length) {
    return "";
  }

  const staticIndex = segments.lastIndexOf("static");
  if (staticIndex === -1) {
    return path.posix.basename(staticRoot);
  }

  const namespaceSegments = segments.slice(staticIndex + 1).filter(Boolean);
  if (!namespaceSegments.length) {
    return "";
  }

  const namespace = namespaceSegments.join("/");

  if (namespace.startsWith("..")) {
    return "";
  }

  return namespace;
}

function looksLikeAssetTarget(targetPath) {
  if (!targetPath) {
    return false;
  }

  const extension = path.posix.extname(targetPath).toLowerCase();
  if (!extension) {
    return false;
  }

  return !MARKDOWN_EXTENSIONS.has(extension);
}

function shouldThrowForMissingAsset({ assetCandidate, assetPublicPath }) {
  return assetCandidate && !assetPublicPath;
}

function resolveExistingAssetPublicPath({
  sanitizedPath,
  normalizedAssetTarget,
  docRelativePath,
  docsPath,
  staticPath,
}) {
  const existingStaticAbsolute = resolveExistingAbsoluteStaticAsset({
    sanitizedPath,
    staticPath,
  });

  if (existingStaticAbsolute) {
    return existingStaticAbsolute;
  }

  const normalizedTarget = normalizedAssetTarget?.replace(/^\/+/, "");

  if (!normalizedTarget) {
    return null;
  }

  if (assetExistsInDocs({ docsPath, normalizedTarget })) {
    return sanitizedPath;
  }

  const staticFallback = resolveExistingStaticAsset({
    normalizedTarget,
    docRelativePath,
    docsPath,
    staticPath,
  });

  if (staticFallback) {
    return staticFallback;
  }

  return null;
}

function resolveExistingAbsoluteStaticAsset({ sanitizedPath, staticPath }) {
  if (!sanitizedPath || !staticPath || !sanitizedPath.startsWith("/")) {
    return null;
  }

  const trimmed = sanitizedPath.replace(/^\/+/, "");
  if (!trimmed) {
    return null;
  }

  const normalizedStaticRoot = normalizeToPosix(staticPath);
  if (!normalizedStaticRoot) {
    return null;
  }

  const namespace = extractStaticNamespace(normalizedStaticRoot);

  let storageRelativePath = trimmed;

  if (namespace) {
    if (!trimmed.startsWith(`${namespace}/`)) {
      return null;
    }
    storageRelativePath = trimmed.slice(namespace.length).replace(/^\/+/, "");
  }

  if (!storageRelativePath) {
    return null;
  }

  if (assetExistsOnDisk(toSystemSubPath(staticPath, storageRelativePath))) {
    return sanitizedPath;
  }

  return null;
}

function resolveExistingStaticAsset({
  normalizedTarget,
  docRelativePath,
  docsPath,
  staticPath,
}) {
  if (!staticPath) {
    return null;
  }

  const storageCandidates = deriveStaticStorageCandidates({
    normalizedTarget,
    docRelativePath,
    docsPath,
  });

  for (const storageRelativePath of storageCandidates) {
    if (!assetExistsOnDisk(toSystemSubPath(staticPath, storageRelativePath))) {
      continue;
    }

    const namespacedAssetPath = deriveStaticPublicPath({
      staticPath,
      storageRelativePath,
    });

    if (namespacedAssetPath) {
      return namespacedAssetPath;
    }

    const relativePath = deriveRelativeAssetPath({
      docRelativePath,
      docsPath,
      staticPath,
      storageRelativePath,
    });

    if (relativePath) {
      return relativePath;
    }

    return `/${storageRelativePath}`.replace(/\/+/g, "/");
  }

  return null;
}

function deriveStaticStorageCandidates({
  normalizedTarget,
  docRelativePath,
  docsPath,
}) {
  const normalized = normalizedTarget?.replace(/^\/+/, "");
  if (!normalized) {
    return [];
  }

  const segments = normalized.split("/").filter(Boolean);
  if (!segments.length) {
    return [];
  }

  const candidates = new Set();
  candidates.add(path.posix.join(STATIC_ASSET_PREFIX, normalized));

  const potentialRoots = [];
  // Capture common root segments so we can also probe trimmed static paths.

  if (docRelativePath) {
    const docSegments = normalizeToPosix(docRelativePath)
      .split("/")
      .filter(Boolean);
    if (docSegments.length) {
      potentialRoots.push(docSegments[0]);
    }
  }

  if (docsPath) {
    const docsBase = path.posix.basename(normalizeToPosix(docsPath));
    if (docsBase) {
      potentialRoots.push(docsBase);
    }
  }

  for (const root of potentialRoots) {
    if (!root) {
      continue;
    }

    const leading = segments[0];
    if (leading && leading.toLowerCase() === root.toLowerCase()) {
      const trimmedSegments = segments.slice(1);
      if (trimmedSegments.length) {
        candidates.add(
          path.posix.join(STATIC_ASSET_PREFIX, trimmedSegments.join("/")),
        );
      }
    }
  }

  return Array.from(candidates);
}

function assetExistsInDocs({ docsPath, normalizedTarget }) {
  if (!docsPath || !normalizedTarget) {
    return false;
  }

  const primaryCandidate = toSystemSubPath(docsPath, normalizedTarget);
  if (assetExistsOnDisk(primaryCandidate)) {
    return true;
  }

  const segments = normalizedTarget.split("/");
  const docsBase = path.posix.basename(normalizeToPosix(docsPath));

  if (segments.length > 1 && docsBase) {
    const [first, ...rest] = segments;
    if (first && first.toLowerCase() === docsBase.toLowerCase()) {
      const trimmed = rest.join("/");
      if (trimmed) {
        return assetExistsOnDisk(toSystemSubPath(docsPath, trimmed));
      }
    }
  }

  return false;
}

function toSystemSubPath(root, posixPath) {
  if (!root) {
    return null;
  }

  if (!posixPath) {
    return root;
  }

  const segments = posixPath.split("/").filter(Boolean);
  return path.join(root, ...segments);
}

function assetExistsOnDisk(candidatePath) {
  if (!candidatePath) {
    return false;
  }

  return fs.existsSync(candidatePath);
}

function createMissingAssetError({
  docRelativePath,
  normalizedAssetTarget,
  originalTarget,
  sanitizedPath,
}) {
  const normalizedDisplay = normalizedAssetTarget || sanitizedPath;
  const docDisplay = docRelativePath || "<unknown document>";

  return new Error(
    `Missing asset registration for "${normalizedDisplay}" referenced from "${docDisplay}" (original link "${originalTarget}").`,
  );
}

module.exports = {
  AssetRewriter,
};
