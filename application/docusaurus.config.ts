import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const preprocessMarkdownForMdx = (markdown: string): string => {
	const protectedBlocks: string[] = [];
	const placeholderPrefix = "@@HOVERKRAFT_PROTECTED_BLOCK_";
	const protectedBlockRegex = /```[\s\S]*?```|<pre\b[^>]*>[\s\S]*?<\/pre>/gi;

	const protectedMarkdown = markdown.replace(protectedBlockRegex, (block) => {
		if (!block.toLowerCase().startsWith("<pre")) {
			const index = protectedBlocks.push(block) - 1;
			return `${placeholderPrefix}${index}@@`;
		}

		const preBlock = block;
		const startTagEnd = preBlock.indexOf(">") + 1;
		const endTagStart = preBlock.lastIndexOf("</pre>");

		if (startTagEnd === 0 || endTagStart === -1) {
			const index = protectedBlocks.push(preBlock) - 1;
			return `${placeholderPrefix}${index}@@`;
		}

		const content = preBlock.slice(startTagEnd, endTagStart);
		const escapedContent = content
			.replace(/\{+/g, (match) => match.replace(/\{/g, "&#123;"))
			.replace(/\}+/g, (match) => match.replace(/\}/g, "&#125;"));
		const escapedPreBlock =
			preBlock.slice(0, startTagEnd) +
			escapedContent +
			preBlock.slice(endTagStart);
		const index = protectedBlocks.push(escapedPreBlock) - 1;

		return `${placeholderPrefix}${index}@@`;
	});

	const convertedMarkdown = protectedMarkdown.replace(
		/<!--([\s\S]*?)-->/g,
		(_match, commentContent: string) => {
			return `{/*${commentContent}*/}`;
		},
	);

	return convertedMarkdown.replace(
		new RegExp(`${placeholderPrefix}(\\d+)@@`, "g"),
		(_match, index: string) => {
			return protectedBlocks[Number(index)];
		},
	);
};

const algoliaThemeConfig =
	process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_API_KEY
		? {
				appId: process.env.ALGOLIA_APP_ID,
				apiKey: process.env.ALGOLIA_API_KEY,
				indexName: "Hoverkraft Documentation Portal",
				contextualSearch: true,
				searchParameters: {},
				searchPagePath: "search",
				insights: false,
				askAi: process.env.ALGOLIA_ASK_AI_ASSISTANT_ID,
			}
		: undefined;

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: "Hoverkraft Docs",
	tagline: "Documentation for Hoverkraft open-source projects (aka openkraft)",

	// Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
	future: {
		v4: true, // Improve compatibility with the upcoming Docusaurus v4
	},

	// Set the production url of your site here
	url: "https://docs.hoverkraft.cloud",
	// Set the /<baseUrl>/ pathname under which your site is served
	// For custom domain deployment, this is typically '/'
	baseUrl: "/",

	trailingSlash: true,

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: "hoverkraft-tech", // Usually your GitHub org/user name.
	projectName: "public-docs", // Usually your repo name.

	onBrokenLinks: "throw",

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl:
						"https://github.com/hoverkraft-tech/public-docs/blob/main/application/",
					showLastUpdateAuthor: true,
					showLastUpdateTime: true,
				},
			} satisfies Preset.Options,
		],
	],

	themes: ["@hoverkraft/docusaurus-theme"],

	markdown: {
		preprocessor: ({ fileContent }) => preprocessMarkdownForMdx(fileContent),
		hooks: {
			onBrokenMarkdownLinks: "throw",
		},
	},

	themeConfig: {
		// Replace with your project's social card
		image: "img/docusaurus-social-card.jpg",
		colorMode: {
			respectPrefersColorScheme: true,
		},
		navbar: {
			title: "Hoverkraft Docs",
			items: [
				{
					type: "docSidebar",
					sidebarId: "tutorialSidebar",
					position: "left",
					label: "Intro",
				},
				{
					type: "docSidebar",
					sidebarId: "tutorialSidebar",
					position: "left",
					label: "Methodology",
					href: "/docs/methodology",
				},
				{
					type: "docSidebar",
					sidebarId: "tutorialSidebar",
					position: "left",
					label: "Projects",
					href: "/docs/projects",
				},
				{
					href: "https://github.com/hoverkraft-tech",
					label: "GitHub",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			links: [
				{
					title: "Documentation",
					items: [
						{
							label: "Getting Started",
							to: "/docs/intro",
						},
					],
				},
				{
					title: "Community",
					items: [
						{
							label: "GitHub Organization",
							href: "https://github.com/hoverkraft-tech",
						},
					],
				},
				{
					title: "More",
					items: [
						{
							label: "Site",
							to: "https://hoverkraft.cloud",
						},
						{
							label: "GitHub",
							href: "https://github.com/hoverkraft-tech/public-docs",
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} Hoverkraft. Built with Docusaurus.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.vsDark,
			additionalLanguages: ["bash", "json", "yaml", "typescript", "javascript"],
		},
		...(algoliaThemeConfig
			? {
					algolia: algoliaThemeConfig,
				}
			: {}),
	} satisfies Preset.ThemeConfig,
};

export default config;
