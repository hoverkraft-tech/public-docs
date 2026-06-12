#!/usr/bin/env node

const { DocumentationGenerator } = require("./lib/documentation-generator");

async function run({ github }) {
	try {
		const generator = new DocumentationGenerator({ github });
		await generator.run();
	} catch (error) {
		console.error("❌ Error during generation:", error);
		throw error;
	}
}

module.exports = { run };
