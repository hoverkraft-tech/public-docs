"use strict";

const path = require("path");
const { STATIC_ASSET_PREFIX } = require("../constants");
const { normalizeToPosix } = require("./path-utils");

function registerAssetPath(assetMap, assetPath) {
  const key = normalizeToPosix(assetPath);
  const storageRelativePath = path.posix.join(STATIC_ASSET_PREFIX, key);
  const publicPath = `/${storageRelativePath}`.replace(/\/+/g, "/");

  if (!assetMap.has(key)) {
    assetMap.set(key, publicPath);
  }

  return { key, storageRelativePath, publicPath };
}

function resolveAssetPublicPath({ assetMap, docRelativePath, targetPath }) {
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

  return assetMap.get(normalizedTarget) || null;
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
