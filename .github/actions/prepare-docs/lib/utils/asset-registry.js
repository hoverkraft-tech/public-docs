"use strict";

const path = require("path");
const { STATIC_ASSET_PREFIX } = require("../constants");
const { normalizeToPosix } = require("./path-utils");

function registerAssetPath(assetMap, assetPath) {
  const key = normalizeToPosix(assetPath);
  const storageRelativePath = path.posix.join(STATIC_ASSET_PREFIX, key);
  const publicPath = `/${storageRelativePath}`.replace(/\/+/g, "/");

  if (!assetMap.has(key)) {
    assetMap.set(key, {
      storageRelativePath,
      publicPath,
    });
  }

  const registration = assetMap.get(key);

  return {
    key,
    storageRelativePath: registration.storageRelativePath,
    publicPath: registration.publicPath,
  };
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
    targetPath
  );
  if (!normalizedTarget) {
    return null;
  }

  const registration = assetMap.get(normalizedTarget);
  if (!registration) {
    return null;
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
    normalizeToPosix(storageRelativePath)
  );

  const relativePath = path.posix.relative(
    effectiveDocDirectory,
    assetFullPath
  );

  if (!relativePath) {
    return null;
  }

  return relativePath.replace(/\\/g, "/");
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

module.exports = {
  registerAssetPath,
  resolveAssetPublicPath,
};
