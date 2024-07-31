/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */

import "dotenv/config";
import path from "path";
import { open, stat, readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import postcss from "postcss";
import postcssrc from "postcss-load-config";
import { minify } from "terser";
import svgstore from "svgstore";
import { optimize } from "svgo";
import ghostContentAPI from "@tryghost/content-api";
import mustachePlugin from "@11ty/eleventy-plugin-mustache";
import localImages from "eleventy-plugin-local-images";

const paths = {
	sprites: {
		src: 'assets/images/social-icons/',
		dest: '_site/assets/images/social-icons/build/',
	},
	sitemap: {
		src: [ '_site', '!_site/error/*.html' ],
	},
};

const portfolioApi = new ghostContentAPI({
	url: process.env.GHOST_CONTENT_API_URL,
	key: process.env.GHOST_CONTENT_API_KEY,
	version: "v5.0",
});

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

	if (typeof map !== 'string' || typeof map !== 'Buffer') {
		map = map.toString();
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
	// 	const relativizeHtml = new RegExp( `${process.env.GHOST_CONTENT_API_URL}`, "g" );
	// 	if ( item.feature_image !== null ) {
	// 		item.feature_image = item.feature_image.replace( relativizeHtml, '' );
	// 	}
	// 	item.html = item.html.replace( relativizeHtml, '' );

	// Remove srcset attributes from images until https://github.com/robb0wen/eleventy-plugin-local-images/issues/15
	// is fixed and plugin supports multiple selectors.
	// RegEx source: https://stackoverflow.com/a/450117
	item.html = item.html.replace( new RegExp( 'srcset\s*=\s*"(.+?)"', 'g' ), '' );

	return item;
}

async function getPortfolioData() {
	const posts = await getPortfolioPosts();
	const pages = await getPortfolioPages();

	return [posts, pages].flat();
}

async function getPortfolioPosts() {
	return portfolioApi.posts
		.browse( { include: 'tags' } )
		.then( ( posts ) => {
			let postsSaved = [];
			posts.forEach( (post) => {
				const processedPost = processItemData( post );
				processedPost.type = 'post';

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
				processedPost.type = 'page';

				pagesSaved.push( processedPost );
			} );
			return pagesSaved;
		} )
		.catch( ( err ) => {
			console.error( err );
		} );
}


export default function ( eleventyConfig ) {
	// Passthrough files
	eleventyConfig.addPassthroughCopy( './assets/favicons' );
	eleventyConfig.addPassthroughCopy( './assets/fonts' );
	eleventyConfig.addPassthroughCopy( './assets/icons' );
	eleventyConfig.addPassthroughCopy( './assets/images' );
	eleventyConfig.addPassthroughCopy( './miscellanea/**/images/*' );
	eleventyConfig.addPassthroughCopy( './miscellanea/social-icons/**/' );
	eleventyConfig.addPassthroughCopy( './portfolio/_assets' );
	eleventyConfig.addPassthroughCopy( './manifest.webmanifest' );
	eleventyConfig.addPassthroughCopy( './.well-known' );
	eleventyConfig.addPassthroughCopy( './sitemap.xml' );

	// Passthrough during serve
	eleventyConfig.setServerPassthroughCopyBehavior( 'passthrough' );

	const additionalLogging = process.env.CI == true || process.env.ENV === 'production' || process.env.VERCEL_ENV === 'production';

	eleventyConfig.addPlugin(mustachePlugin);
	eleventyConfig.addPlugin( localImages, {
		distPath: '_site',
		assetPath: '/assets/images/portfolio-assets',
		attribute: 'src',
		verbose: additionalLogging
	} );

	eleventyConfig.addCollection( 'posts', async (collection) => {
		const portfolioData = await getPortfolioData();
		collection = portfolioData;

		if (additionalLogging) {
			console.log( `${collection.length} pages added to \`posts\` collection.` );
		}
		return collection;
	});

	eleventyConfig.addCollection( 'featured', async (collection) => {
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
			console.log( `${Object.keys(collection).length} pages added to \`featured\` collection.` );
		}
		return collection;
	});

	eleventyConfig.addCollection( 'bin', async (collection) => {
		const portfolioData = await getPortfolioData();
		const filteredPortfolioData = portfolioData.filter(
			(post) => post.type !== "page" && post.featured !== true
		);
		collection = filteredPortfolioData;

		if (additionalLogging) {
			console.log( `${collection.length} pages added to \`bin\` collection.` );
		}
		return collection;
	});

	eleventyConfig.addExtension( 'css', {
		outputFileExtension: 'css',

		// `compile` is called once per .css file in the input directory
		compile: async function ( inputContent, inputPath ) {
			// Skip names beginning with an underscore.
			let parsed = path.parse(inputPath);
			if ( parsed.name.startsWith( '_' ) || parsed.name.includes( 'variables' ) ) {
				return;
			}

			const { plugins, options } = await postcssrc( {
				from: inputPath,
				to: path.join( eleventyConfig.dir.output, inputPath )
			} );
			let result = await postcss( plugins ).process( inputContent, options );

			// Save sourcemap to file
			if ( typeof result.map !== 'undefined' ) {
				await saveSourcemap( path.join( eleventyConfig.dir.output, inputPath ), result.map );
			}

			// This is the render function, `data` is the full data cascade
			return async ( data ) => {
				return result.css;
			};
		},

		compileOptions: {
			permalink: "raw"
		},
	});

	eleventyConfig.addExtension( 'js', {
		outputFileExtension: 'js',

		// `compile` is called once per .css file in the input directory
		compile: async function ( inputContent, inputPath, page ) {
			let parsed = path.parse( inputPath );

			if (
				parsed.name.includes( 'eleventy' ) ||
				parsed.name.includes( 'service-worker' )
			) {
				// Skip dev files
				return;
			} else if ( parsed.name.includes( 'social-icons' ) ) {
				// Custom include for social-icons file
				let flickity = await readFile(
					'node_modules/flickity/dist/flickity.pkgd.js',
					{ encoding: 'utf8' }
				);
				inputContent = {
					'flickity.js': flickity,
					'social-icons.js': inputContent,
				};
			}

			const options = {
				sourceMap: {
					filename: parsed.base,
					url: `${parsed.base}.map`,
				},
			};
			let result = await minify( inputContent, options );

			// Save sourcemap to file
			if ( typeof result.map !== 'undefined' ) {
				await saveSourcemap( path.join( eleventyConfig.dir.output, inputPath ), result.map );
			}

			// This is the render function, `data` is the full data cascade
			return async ( data ) => {
				return result.code;
			};
		},

		compileOptions: {
			permalink: "raw"
		},
	} );

	eleventyConfig.on( 'eleventy.before', async () => {
		const sprites = svgstore();
		const svgDirFileNames = await readdir( paths.sprites.src );
		const spriteFilePath = path.join( paths.sprites.dest, 'home-sprite.svg' );

		for ( const fileName of svgDirFileNames ) {
			const filePath = path.join( paths.sprites.src, fileName );
			const parsedFilePath = path.parse( filePath );

			// skip invisible or hidden files
			if ( parsedFilePath.name[0] !== '.' ) {
				// The below can error if there is a directory found. TODO: Add check for is directory/is readable.
				let fileContents = await readFile( filePath, {
					encoding: 'utf8',
				} );
				sprites.add( parsedFilePath.name, fileContents );
			}
		}
		const combinedSprite = sprites.toString( { inline: true } );

		const { data: optimizedSprite } = optimize( combinedSprite, {
			path: spriteFilePath,
			multipass: true,
			plugins: [ {
				name: 'preset-default',
				params: {
					overrides: {
						cleanupIds: false,
						removeUselessDefs: false,
						removeHiddenElems: false
					},
				},
			} ],
		} );

		await mkdir( paths.sprites.dest, {
			recursive: true,
		} );
		await writeFile( spriteFilePath, optimizedSprite );
	} );

	return {
		templateFormats: [ 'mustache', 'njk', 'css', 'js' ],
	};
};
