/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */

const path = require("path");
const { open, stat, readFile, readdir, writeFile, mkdir } = require("node:fs/promises");
const postcss = require("postcss");
const { minify } = require("terser");
const svgSprite = require("svg-sprite");
const ghostContentAPI = require("@tryghost/content-api");
const localImages = require('eleventy-plugin-local-images');
require("dotenv").config();

const paths = {
	scripts: {
		dest: "_site/assets/scripts/",
	},
	sprites: {
		src: "assets/images/social-icons/",
		dest: "_site/assets/images/social-icons/build/",
	},
	sitemap: {
		src: ["_site", "!_site/error/*.html"],
	},
};

const portfolioUrl = process.env.GHOST_CONTENT_API_URL;

const portfolioApi = new ghostContentAPI({
	url: process.env.GHOST_CONTENT_API_URL,
	key: process.env.GHOST_CONTENT_API_KEY,
	version: "v5.0",
});

const processors = [
	require( 'postcss-import' ),
	require( 'postcss-normalize' ),
	require( 'postcss-nested' ),
	require( 'postcss-custom-properties' ),
	require( 'postcss-custom-media' ),
	require( 'postcss-sort-media-queries' ),
	require( 'postcss-color-rgb' ),
	require( 'postcss-100vh-fix' ),
	require( 'autoprefixer' ),
	require( 'cssnano' )({
		preset: [
			"default",
			{
				mergeRules: false,
			},
		],
	}),
];

async function saveSourcemap( filepath, map ) {
	const outPath = path.parse( filepath );

	try {
		const outDir = await open( outPath.dir );
		outDir.close();
	} catch( error ) {
		console.log( `${filepath} could not be opened. Attempting to create directory.` );
		await mkdir( outPath.dir, {
			recursive: true,
		} );
	}

	return await writeFile(
		`${filepath}.map`,
		map
	);
}

function camelize( str ) {
	// from: https://stackoverflow.com/a/2970667
	return str.replace( /(?:^\w|[A-Z]|\b\w|\s+ )/g, function ( match, index ) {
		if ( +match === 0 ) return ""; // or if (/\s+/.test(match)) for white spaces
		return index == 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

function getPathUrl( url ) {
	const postUrl = new URL( url );
	return `/portfolio${postUrl.pathname}${postUrl.search}`;
}

function processItemData( item ) {
	item.url = getPathUrl( item.url );
	// Strip out the absolute part of the URL from HTML item data.
	// 	const relativizeHtml = new RegExp( `${portfolioUrl}`, "g" );
	// 	if ( item.feature_image !== null ) {
	// 		item.feature_image = item.feature_image.replace( relativizeHtml, '' );
	// 	}
	// 	item.html = item.html.replace( relativizeHtml, '' );

	// Remove srcset attributes from images until https://github.com/robb0wen/eleventy-plugin-local-images/issues/15
	// is fixed and plugin supports multiple selectors.
	item.html = item.html.replace( new RegExp( 'srcset=(["\'])?((?:.(?!\1|>))*.?)\1?', 'g' ), '' );

	return item;
}

async function getPortfolioData() {
	const posts = await getPortfolioPosts();
	const pages = await getPortfolioPages();

	return [posts, pages].flat();
}

async function getPortfolioPosts() {
	return portfolioApi.posts
		.browse( { include: "tags" } )
		.then( ( posts ) => {
			let postsSaved = [];
			posts.forEach( (post) => {
				const processedPost = processItemData( post );
				processedPost.type = "post";

				postsSaved.push( processedPost );
			} );
			return postsSaved;
		} )
		.catch( (err) => {
			console.error( err );
		} );
}

async function getPortfolioPages() {
	return portfolioApi.pages
		.browse()
		.then( ( pages ) => {
			let pagesSaved = [];
			pages.forEach( ( page ) => {
				const processedPost = processItemData( page );
				processedPost.type = "page";

				pagesSaved.push( processedPost );
			} );
			return pagesSaved;
		} )
		.catch( ( err ) => {
			console.error( err );
		} );
}


module.exports = function ( eleventyConfig ) {
	// Passthrough files
	eleventyConfig.addPassthroughCopy("./assets/favicons");
	eleventyConfig.addPassthroughCopy("./assets/fonts");
	eleventyConfig.addPassthroughCopy("./assets/icons");
	eleventyConfig.addPassthroughCopy("./assets/images");
	eleventyConfig.addPassthroughCopy("./miscellanea/**/images/*");
	eleventyConfig.addPassthroughCopy("./miscellanea/social-icons/**/");
	eleventyConfig.addPassthroughCopy("./portfolio/_assets");
	eleventyConfig.addPassthroughCopy("./manifest.webmanifest");
	eleventyConfig.addPassthroughCopy("./.well-known");
	eleventyConfig.addPassthroughCopy("./sitemap.xml");

	// Passthrough during serve
	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	const additionalLogging = process.env.CI == true || process.env.ENV === 'production' || process.env.VERCEL_ENV === 'production';

	eleventyConfig.addPlugin( localImages, {
		distPath: '_site',
		assetPath: '/assets/images/portfolio-assets',
		attribute: 'src',
		verbose: additionalLogging
	} );

	eleventyConfig.addCollection("posts", async (collection) => {
		const portfolioData = await getPortfolioData();
		collection = portfolioData;

		if (additionalLogging) {
			console.log(`${collection.length} pages added to \`posts\` collection.`)
		}
		return collection;
	});

	eleventyConfig.addCollection("featured", async (collection) => {
		const portfolioData = await getPortfolioData();
		const filteredPortfolioData = portfolioData.filter(
			(post) => post.featured === true
		);
		// Make an object of featured posts so we can easily grab them by name in the featured partial templates.
		let featuredPosts = {};
		filteredPortfolioData.forEach((post) => {
			const index = camelize(post.slug).replace("-", "");
			featuredPosts[index] = post;
		});
		collection = featuredPosts;

		if (additionalLogging) {
			console.log(`${Object.keys(collection).length} pages added to \`featured\` collection.`)
		}
		return collection;
	});

	eleventyConfig.addCollection("bin", async (collection) => {
		const portfolioData = await getPortfolioData();
		const filteredPortfolioData = portfolioData.filter(
			(post) => post.type !== "page" && post.featured !== true
		);
		collection = filteredPortfolioData;

		if (additionalLogging) {
			console.log(`${collection.length} pages added to \`bin\` collection.`)
		}
		return collection;
	});

	eleventyConfig.addExtension("css", {
		outputFileExtension: "css",

		// `compile` is called once per .css file in the input directory
		compile: async function (inputContent, inputPath) {
			// Skip names beginning with an underscore.
			let parsed = path.parse(inputPath);
			if (parsed.name.startsWith("_") || parsed.name.includes("variables")) {
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

	eleventyConfig.addExtension( 'js', {
		outputFileExtension: 'js',

		// `compile` is called once per .css file in the input directory
		compile: async function ( inputContent, inputPath, page ) {
			let parsed = path.parse( 'inputPath' );

			if (
				parsed.name.includes( 'eleventy' ) ||
				parsed.name.includes( 'service-worker' )
			) {
				// Skip dev files
				return;
			} else if ( parsed.name.includes( "social-icons" ) ) {
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
					filename: parsed.base,
					url: `${parsed.base}.map`,
				},
			};
			let result = await minify( inputContent, options );

			if ( typeof result.map !== 'undefined' ) {
				await saveSourcemap( path.join( paths.scripts.dest, parsed.base ), result.map );
			}

			// This is the render function, `data` is the full data cascade
			return async ( data ) => {
				return result.code;
			};
		},
	} );

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
		const spriter = new svgSprite( options );
		const svgDirFileNames = await readdir( paths.sprites.src );

		for ( const fileName of svgDirFileNames ) {
			const filePath = path.join( paths.sprites.src, fileName );

			// The below can error if there is a directory found. TODO: Add check for is directory/is readable.
			let fileContents = await readFile( filePath, {
				encoding: "utf8",
			} );
			spriter.add( path.resolve( filePath ), fileName, fileContents );
		}

		const { result } = await spriter.compileAsync();
		for ( const mode of Object.values( result ) ) {
			for ( const resource of Object.values( mode ) ) {
				await mkdir( paths.sprites.dest, {
					recursive: true,
				} );
				await writeFile(
					path.join( paths.sprites.dest, path.parse( resource.path ).base ),
					resource.contents
				);
			}
		}
	});

	return {
		templateFormats: [ 'mustache', 'njk', 'css', 'js' ],
	};
};
