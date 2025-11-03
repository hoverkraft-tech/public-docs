const fs = require("fs").promises;

class ConstDeclarationUpdater {
  constructor({ fileSystem } = {}) {
    this.fileSystem = fileSystem ?? fs;
  }

  async update(filePath, declarations) {
    if (!Array.isArray(declarations)) {
      throw new Error(
        "ConstDeclarationUpdater expected 'declarations' to be an array.",
      );
    }

    if (declarations.length === 0) {
      return;
    }

    const originalContent = await this.fileSystem.readFile(filePath, "utf8");
    let updatedContent = originalContent;
    let hasChanges = false;

    for (const declaration of declarations) {
      const serializedValue = this.resolveSerializedValue(declaration);
      const nextContent = replaceConstDeclaration(
        updatedContent,
        declaration.name,
        serializedValue,
      );

      if (nextContent !== updatedContent) {
        hasChanges = true;
        updatedContent = nextContent;
      }
    }

    if (hasChanges) {
      await this.fileSystem.writeFile(filePath, updatedContent, "utf8");
    }
  }

  resolveSerializedValue(declaration) {
    if (!declaration || typeof declaration !== "object") {
      throw new Error(
        "ConstDeclarationUpdater expected each declaration to be an object.",
      );
    }

    const { name, serializedValue } = declaration;

    if (!name) {
      throw new Error(
        "Const declaration update requires a declaration 'name'.",
      );
    }

    if (typeof serializedValue === "string") {
      return serializedValue;
    }

    if ("value" in declaration) {
      const serializer =
        typeof declaration.serialize === "function"
          ? declaration.serialize
          : (value) => serializeForTs(value);

      const serialized = serializer(declaration.value);

      if (typeof serialized !== "string") {
        throw new Error(`Serializer for '${name}' must return a string.`);
      }

      return serialized;
    }

    throw new Error(
      `Const declaration update for '${name}' requires either 'value' or 'serializedValue'.`,
    );
  }
}

function replaceConstDeclaration(source, name, serializedValue) {
  const pattern = new RegExp(
    `(?<indent>^\\s*)(?<exportKeyword>export\\s+)?const ${name}(?<annotation>:[^=]+)? = [\\s\\S]*?;`,
    "m",
  );

  const match = pattern.exec(source);

  if (!match) {
    throw new Error(
      `Unable to locate '${name}' declaration in source file for update.`,
    );
  }

  const {
    indent = "",
    annotation = "",
    exportKeyword = "",
  } = match.groups ?? {};
  const indentedValue = applyIndent(serializedValue, indent);
  const replacement = `${indent}${
    exportKeyword ?? ""
  }const ${name}${annotation} = ${indentedValue};`;

  return (
    source.slice(0, match.index) +
    replacement +
    source.slice(match.index + match[0].length)
  );
}

function applyIndent(value, indent) {
  if (!indent) {
    return value;
  }

  return value
    .split("\n")
    .map((line, index) => (index === 0 ? line : `${indent}${line}`))
    .join("\n");
}

function serializeForTs(value, indentLevel = 0) {
  const indent = "  ".repeat(indentLevel);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    const items = value
      .map((item) => serializeForTs(item, indentLevel + 1))
      .map((item) => `${"  ".repeat(indentLevel + 1)}${item}`)
      .join(",\n");

    return `[\n${items}\n${indent}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return "{}";
    }

    const body = entries
      .map(
        ([key, val]) =>
          `${"  ".repeat(indentLevel + 1)}${key}: ${serializeForTs(
            val,
            indentLevel + 1,
          )}`,
      )
      .join(",\n");

    return `{\n${body}\n${indent}}`;
  }

  if (typeof value === "string") {
    return `'${escapeString(value)}'`;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value === null) {
    return "null";
  }

  throw new Error(`Unsupported value type for serialization: ${typeof value}`);
}

function escapeString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/'/g, "\\'");
}

module.exports = {
  ConstDeclarationUpdater,
  serializeForTs,
};
