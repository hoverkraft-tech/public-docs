#!/usr/bin/env node

/**
 * Documentation Aggregation Script
 * 
 * This script pulls documentation from various Hoverkraft project repositories
 * and aggregates them into this central documentation portal.
 * 
 * The documentation source remains in each project repository (atomic),
 * but this script creates a unified view by pulling the content here.
 */

const fs = require("fs").promises;
const path = require("path");
const { Octokit } = require("@octokit/rest");
const yaml = require("js-yaml");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = "hoverkraft-tech";
const CONFIG_FILE = path.join(__dirname, "..", "docs-sources.yml");
const DOCS_DIR = path.join(__dirname, "..", "..", "application", "docs");

/**
 * Load configuration from docs-sources.yml
 */
async function loadConfig() {
  try {
    const configContent = await fs.readFile(CONFIG_FILE, "utf8");
    const config = yaml.load(configContent);
    console.log(`📋 Loaded configuration for ${config.repositories.length} repositories`);
    return config;
  } catch (error) {
    console.error("❌ Error loading configuration:", error.message);
    throw error;
  }
}

/**
 * Get the content of a file or directory from a GitHub repository
 */
async function getRepoContent(repo, path, branch = "main") {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: OWNER,
      repo: repo,
      path: path,
      ref: branch,
    });
    return data;
  } catch (error) {
    if (error.status === 404) {
      console.warn(`⚠️  Path not found: ${repo}/${path}`);
      return null;
    }
    throw error;
  }
}

/**
 * Decode base64 content from GitHub API
 */
function decodeContent(content) {
  return Buffer.from(content, "base64").toString("utf8");
}

/**
 * Add frontmatter with source metadata to markdown content
 */
function addSourceMetadata(content, metadata) {
  const frontmatter = `---
source_repo: ${metadata.repo}
source_path: ${metadata.path}
source_branch: ${metadata.branch}
last_synced: ${new Date().toISOString()}
---

`;

  // If content already has frontmatter, merge it
  if (content.trim().startsWith("---")) {
    const endOfFrontmatter = content.indexOf("---", 3);
    if (endOfFrontmatter !== -1) {
      const existingFrontmatter = content.substring(0, endOfFrontmatter + 3);
      const bodyContent = content.substring(endOfFrontmatter + 3);
      
      // Parse existing frontmatter and add source info
      const frontmatterContent = content.substring(3, endOfFrontmatter).trim();
      return `---\n${frontmatterContent}\nsource_repo: ${metadata.repo}\nsource_path: ${metadata.path}\nsource_branch: ${metadata.branch}\nlast_synced: ${new Date().toISOString()}\n---${bodyContent}`;
    }
  }

  return frontmatter + content;
}

/**
 * Check if a file should be included based on configuration
 */
function shouldIncludeFile(filename, repoConfig, settings) {
  // Check file extension
  if (settings.allowed_extensions && settings.allowed_extensions.length > 0) {
    const ext = path.extname(filename);
    if (!settings.allowed_extensions.includes(ext)) {
      return false;
    }
  }

  // Check exclude patterns
  if (repoConfig.exclude) {
    for (const pattern of repoConfig.exclude) {
      // Simple pattern matching (can be enhanced with glob library)
      if (filename.includes(pattern.replace("**", "").replace("*", ""))) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Process a single file from a repository
 */
async function processFile(file, repoConfig, settings, targetDir) {
  if (file.type !== "file") {
    return null;
  }

  const filename = path.basename(file.path);
  
  if (!shouldIncludeFile(filename, repoConfig, settings)) {
    console.log(`   ⏭️  Skipping ${filename} (excluded by configuration)`);
    return null;
  }

  // Check file size
  if (file.size > settings.max_file_size * 1024) {
    console.warn(`   ⚠️  Skipping ${filename} (exceeds max size: ${file.size} bytes)`);
    return null;
  }

  try {
    const content = decodeContent(file.content);
    
    // Add source metadata if enabled
    const finalContent = settings.add_source_metadata
      ? addSourceMetadata(content, {
          repo: repoConfig.repository,
          path: file.path,
          branch: repoConfig.branch || settings.default_branch,
        })
      : content;

    // Determine target file path
    const targetPath = path.join(targetDir, filename);
    await fs.writeFile(targetPath, finalContent, "utf8");
    
    console.log(`   ✅ Pulled ${filename}`);
    return targetPath;
  } catch (error) {
    console.error(`   ❌ Error processing ${filename}:`, error.message);
    return null;
  }
}

/**
 * Process a directory recursively
 */
async function processDirectory(items, repoConfig, settings, targetDir) {
  const pulledFiles = [];

  for (const item of items) {
    if (item.type === "file") {
      // Fetch full file content
      const fileData = await getRepoContent(
        repoConfig.repository,
        item.path,
        repoConfig.branch || settings.default_branch
      );
      
      if (fileData) {
        const result = await processFile(fileData, repoConfig, settings, targetDir);
        if (result) {
          pulledFiles.push(result);
        }
      }
    } else if (item.type === "dir") {
      // Recursively process subdirectory
      const subDirContent = await getRepoContent(
        repoConfig.repository,
        item.path,
        repoConfig.branch || settings.default_branch
      );
      
      if (subDirContent) {
        const subTargetDir = path.join(targetDir, path.basename(item.path));
        await fs.mkdir(subTargetDir, { recursive: true });
        const subFiles = await processDirectory(
          subDirContent,
          repoConfig,
          settings,
          subTargetDir
        );
        pulledFiles.push(...subFiles);
      }
    }
  }

  return pulledFiles;
}

/**
 * Pull documentation from a single repository
 */
async function pullRepoDocumentation(repoConfig, settings) {
  console.log(`\n📦 Processing ${repoConfig.repository}...`);

  const branch = repoConfig.branch || settings.default_branch;
  const targetPath = path.join(DOCS_DIR, repoConfig.target_path);

  // Create target directory
  await fs.mkdir(targetPath, { recursive: true });

  const pulledFiles = [];

  // Pull README if configured
  if (settings.include_readme) {
    const readme = await getRepoContent(repoConfig.repository, "README.md", branch);
    if (readme && readme.type === "file") {
      const result = await processFile(readme, repoConfig, settings, targetPath);
      if (result) {
        pulledFiles.push(result);
      }
    }
  }

  // Pull documentation directory or specific files
  if (repoConfig.files && repoConfig.files.length > 0) {
    // Pull specific files
    for (const file of repoConfig.files) {
      const fileData = await getRepoContent(repoConfig.repository, file, branch);
      if (fileData && fileData.type === "file") {
        const result = await processFile(fileData, repoConfig, settings, targetPath);
        if (result) {
          pulledFiles.push(result);
        }
      }
    }
  } else {
    // Pull entire docs directory
    const docsPath = repoConfig.docs_path || settings.default_docs_path;
    const docsContent = await getRepoContent(repoConfig.repository, docsPath, branch);
    
    if (docsContent) {
      if (Array.isArray(docsContent)) {
        // It's a directory
        const dirFiles = await processDirectory(docsContent, repoConfig, settings, targetPath);
        pulledFiles.push(...dirFiles);
      } else if (docsContent.type === "file") {
        // It's a single file
        const result = await processFile(docsContent, repoConfig, settings, targetPath);
        if (result) {
          pulledFiles.push(result);
        }
      }
    }
  }

  // Create an index file if documentation was pulled
  if (pulledFiles.length > 0) {
    await createIndexFile(repoConfig, targetPath, pulledFiles);
  }

  console.log(`   📊 Total files pulled: ${pulledFiles.length}`);
  return pulledFiles;
}

/**
 * Create an index file for the documentation
 */
async function createIndexFile(repoConfig, targetPath, pulledFiles) {
  const indexPath = path.join(targetPath, "_index.md");
  
  const indexContent = `---
title: ${repoConfig.repository}
description: ${repoConfig.description || `Documentation for ${repoConfig.repository}`}
---

# ${repoConfig.repository}

${repoConfig.description || `Documentation for the ${repoConfig.repository} project.`}

## Documentation

This documentation is automatically synchronized from the [${repoConfig.repository}](https://github.com/${OWNER}/${repoConfig.repository}) repository.

## Available Documentation

${pulledFiles.map(f => `- [${path.basename(f, path.extname(f))}](./${path.basename(f)})`).join("\n")}

---

**Source Repository:** [${OWNER}/${repoConfig.repository}](https://github.com/${OWNER}/${repoConfig.repository})  
**Last Synced:** ${new Date().toISOString()}
`;

  await fs.writeFile(indexPath, indexContent, "utf8");
}

/**
 * Clean old documentation that is no longer configured
 */
async function cleanOldDocumentation(config) {
  console.log("\n🧹 Cleaning old documentation...");
  
  const projectsDir = path.join(DOCS_DIR, "projects");
  
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    const configuredRepos = new Set(
      config.repositories
        .filter(r => r.enabled)
        .map(r => r.target_path.replace("projects/", ""))
    );

    for (const entry of entries) {
      if (entry.isDirectory() && !configuredRepos.has(entry.name)) {
        const dirPath = path.join(projectsDir, entry.name);
        console.log(`   🗑️  Removing ${entry.name} (no longer configured)`);
        await fs.rm(dirPath, { recursive: true, force: true });
      }
    }
  } catch (error) {
    // Projects directory might not exist yet
    if (error.code !== "ENOENT") {
      console.error("❌ Error cleaning old documentation:", error.message);
    }
  }
}

/**
 * Generate a summary report
 */
function generateSummary(results) {
  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalFiles = results.reduce((sum, r) => sum + (r.filesCount || 0), 0);

  console.log("\n" + "=".repeat(60));
  console.log("📊 DOCUMENTATION PULL SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total repositories processed: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total files pulled: ${totalFiles}`);
  console.log("=".repeat(60) + "\n");

  if (failed > 0) {
    console.log("❌ Failed repositories:");
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.repository}: ${r.error}`);
    });
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("🚀 Starting documentation aggregation...\n");

    // Load configuration
    const config = await loadConfig();
    const settings = config.settings || {};

    // Set defaults
    settings.default_branch = settings.default_branch || "main";
    settings.default_docs_path = settings.default_docs_path || "docs";
    settings.include_readme = settings.include_readme !== false;
    settings.add_source_metadata = settings.add_source_metadata !== false;
    settings.update_existing = settings.update_existing !== false;
    settings.max_file_size = settings.max_file_size || 1024;
    settings.allowed_extensions = settings.allowed_extensions || [".md", ".mdx"];

    // Filter enabled repositories
    const enabledRepos = config.repositories.filter(r => r.enabled);
    console.log(`📚 Found ${enabledRepos.length} enabled repositories\n`);

    // Clean old documentation
    if (settings.update_existing) {
      await cleanOldDocumentation(config);
    }

    // Pull documentation from each repository
    const results = [];
    for (const repoConfig of enabledRepos) {
      try {
        const files = await pullRepoDocumentation(repoConfig, settings);
        results.push({
          repository: repoConfig.repository,
          success: true,
          filesCount: files.length,
        });
      } catch (error) {
        console.error(`❌ Failed to pull from ${repoConfig.repository}:`, error.message);
        results.push({
          repository: repoConfig.repository,
          success: false,
          error: error.message,
        });
      }
    }

    // Generate summary
    generateSummary(results);

    console.log("✅ Documentation aggregation completed!");
    
    // Exit with error if any repository failed
    const failed = results.filter(r => !r.success).length;
    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Fatal error during documentation aggregation:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, loadConfig, pullRepoDocumentation };
