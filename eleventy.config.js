const path = require("path");
const { readFile, readdir, writeFile, mkdir } = require("node:fs/promises");
const postcss = require("postcss");
const { minify } = require("terser");
const svgSprite = require("svg-sprite");
const ghostContentAPI = require("@tryghost/content-api");

module.exports = function (eleventyConfig) {
	// Passthrough files
	eleventyConfig.addPassthroughCopy("./assets/favicons");
	eleventyConfig.addPassthroughCopy("./assets/fonts");
	eleventyConfig.addPassthroughCopy("./assets/icons");
	eleventyConfig.addPassthroughCopy("./assets/images");
	eleventyConfig.addPassthroughCopy("./sitemap.xml");

	// Passthrough during serve
	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	const paths = {
		portfolio: {
			indexTemplate: "portfolio/index.mustache",
			postTemplate: "portfolio/_postTemplate/index.mustache",
			dest: "portfolio/",
		},
		styles: {
			src: [
				"assets/styles/**/*.css",
				"!assets/styles/build/**",
				"!assets/styles/variables.css",
				"!assets/styles/partials/_*",
			],
			dest: "assets/styles/build/",
			watch: ["assets/styles/**/*.css", "!assets/styles/build/**"],
		},
		sprites: {
			src: "assets/images/social-icons/*.svg",
			dest: "_site/assets/images/social-icons/build/",
		},
		scripts: {
			src: [
				"assets/scripts/*.js",
				"!assets/scripts/build/**",
				"!assets/scripts/main.js",
				"!assets/scripts/home.js",
				"!assets/scripts/social-icons.js",
			],
			dest: "assets/scripts/build/",
			watch: "assets/scripts/*.js",
		},
		sri: {
			src: ["**/*.html", "!node_modules/**"],
			dest: "./",
		},
		sitemap: {
			src: ["**/*.html", "!error/*.html", "!node_modules/**/*"],
			dest: "./",
		},
	};

	const portfolioUrl = "https://admin.scotthsmith.com";

	const portfolioApi = new GhostContentAPI({
		url: portfolioUrl,
		key: process.env.GHOST_CONTENT_API_KEY,
		version: "v5.0",
	});

	const processors = [
		require("postcss-import"),
		require("postcss-normalize"),
		require("postcss-nested"),
		require("postcss-custom-properties"),
		require("postcss-custom-media"),
		require("postcss-sort-media-queries"),
		require("postcss-color-rgb"),
		require("postcss-100vh-fix"),
		require("autoprefixer"),
		require("cssnano")({
			preset: [
				"default",
				{
					mergeRules: false,
				},
			],
		}),
	];

	function camelize(str) {
		// from: https://stackoverflow.com/a/2970667
		return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
			if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
			return index == 0 ? match.toLowerCase() : match.toUpperCase();
		});
	}

	function getPathUrl(url) {
		const postUrl = new URL(url);
		return `/portfolio${postUrl.pathname}${postUrl.search}`;
	}

	async function getPortfolioData() {
		const posts = await getPortfolioPosts();
		const pages = await getPortfolioPages();

		const postsData = {
			featured: posts.featured,
			bin: posts.bin,
			pages,
		};

		return postsData;
	}

	function processItemData(item) {
		item.url = getPathUrl(item.url);
		// Strip out the absolute part of the URL from HTML item data.
		const relativizeHtml = new RegExp(`${portfolioUrl}`, "g");
		if (item.feature_image !== null) {
			item.feature_image = item.feature_image.replace(relativizeHtml, "");
		}
		item.html = item.html.replace(relativizeHtml, "");

		return item;
	}

	async function getPortfolioPosts() {
		return portfolioApi.posts
			.browse({ include: "tags" })
			.then((posts) => {
				let featuredPosts = {};
				let binPosts = [];
				posts.forEach((post) => {
					if (post.featured) {
						const index = camelize(post.slug).replace("-", "");
						const processedPost = processItemData(post);

						featuredPosts[index] = processedPost;
					} else {
						const processedPost = processItemData(post);

						binPosts.push(processedPost);
					}
				});
				const postsData = {
					featured: featuredPosts,
					bin: binPosts,
				};
				return postsData;
			})
			.catch((err) => {
				console.error(err);
			});
	}

	async function getPortfolioPages() {
		return portfolioApi.pages
			.browse()
			.then((pages) => {
				let pagesSaved = [];
				pages.forEach((page) => {
					const processedPost = processItemData(page);

					pagesSaved.push(processedPost);
				});
				return pagesSaved;
			})
			.catch((err) => {
				console.error(err);
			});
	}

	// 	async function portfolioIndex() {
	// 		const portfolioData = await getPortfolioData();
	//
	// 		return gulp
	// 			.src(paths.portfolio.indexTemplate)
	// 			.pipe(data(portfolioData))
	// 			.pipe(mustache({}, { extension: ".html" }))
	// 			.pipe(gulp.dest(paths.portfolio.dest));
	// 	}

	// 	async function portfolioPosts() {
	// 		const portfolioData = await getPortfolioData();
	// 		let posts = [];
	// 		Object.entries(portfolioData.featured).forEach(([title, content]) => {
	// 			posts.push(content);
	// 		});
	// 		posts = posts.concat(portfolioData.bin, portfolioData.pages);
	//
	// 		posts.map((post) => {
	// 			return gulp
	// 				.src(paths.portfolio.postTemplate)
	// 				.pipe(data({ post: post, bin: portfolioData.bin }))
	// 				.pipe(mustache({}, { extension: ".html" }))
	// 				.pipe(gulp.dest(`${paths.portfolio.dest}${post.slug}`));
	// 		});
	// 	}

	// const portfolio = gulp.parallel(portfolioIndex, portfolioPosts);

	// function stylesForLint() {
	// 	return gulp
	// 		.src(paths.styles.src)
	// 		.pipe(postcss(processors))
	// 		.pipe(gulp.dest(paths.styles.dest));
	// }

	eleventyConfig.addExtension("css", {
		outputFileExtension: "css",

		// `compile` is called once per .css file in the input directory
		compile: async function (inputContent, inputPath) {
			// Skip names beginning with an underscore.
			let parsed = path.parse(inputPath);
			if (parsed.name.startsWith("_")) {
				return;
			}

			let result = await postcss(processors).process(inputContent, {
				from: inputPath,
			});

			// This is the render function, `data` is the full data cascade
			return async (data) => {
				return result.css;
			};
		},
	});

	eleventyConfig.addExtension("js", {
		outputFileExtension: "js",

		// `compile` is called once per .css file in the input directory
		compile: async function (inputContent, inputPath) {
			let parsed = path.parse(inputPath);

			if (
				parsed.name.includes("gulp") ||
				parsed.name.includes("eleventy") ||
				parsed.name.includes("service-worker")
			) {
				// Skip dev files
				return;
			} else if (parsed.name.includes("home")) {
				// Custom include for home file
				let boomsvgloader = await readFile(
					"node_modules/boomsvgloader/dist/js/boomsvgloader.js",
					{ encoding: "utf8" }
				);
				inputContent = {
					"boomsvgloader.js": boomsvgloader,
					"home.js": inputContent,
				};
			} else if (parsed.name.includes("social-icons")) {
				// Custom include for social-icons file
				let flickity = await readFile(
					"node_modules/flickity/dist/flickity.pkgd.js",
					{ encoding: "utf8" }
				);
				inputContent = {
					"flickity.js": flickity,
					"social-icons.js": inputContent,
				};
			}

			const options = {
				sourceMap: {
					filename: "out.js",
					url: `${inputPath}.map`,
				},
			};
			let result = await minify(inputContent, options);

			// This is the render function, `data` is the full data cascade
			return async (data) => {
				return result.code;
			};
		},
	});

	eleventyConfig.on("eleventy.before", async () => {
		const options = {
			mode: {
				symbol: {
					// Create a «symbol» sprite.
					inline: true,
					dest: ".", // Don't create 'symbols/' directory.
					prefix: "", // Don't prefix output title.
					sprite: "home-sprite", // '.svg' will be appended if not included.
				},
			},
		};
		const spriter = new svgSprite(options);
		const svgDir = "assets/images/social-icons";
		const svgDirFileNames = await readdir(svgDir);

		for (const fileName of svgDirFileNames) {
			const filePath = path.join(svgDir, fileName);

			let fileContents = await readFile(filePath, {
				encoding: "utf8",
			});
			spriter.add(path.resolve(filePath), fileName, fileContents);
		}

		const { result } = await spriter.compileAsync();
		for (const mode of Object.values(result)) {
			for (const resource of Object.values(mode)) {
				await mkdir(paths.sprites.dest, {
					recursive: true,
				});
				await writeFile(
					path.join(paths.sprites.dest, path.parse(resource.path).base),
					resource.contents
				);
			}
		}
	});

	return {
		templateFormats: ["html", "mustache", "css", "js"],
	};
};
