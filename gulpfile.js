'use strict';

const gulp = require( 'gulp' );
const mustache = require( 'gulp-mustache' );
const postcss = require( 'gulp-postcss' );
const sprite = require( 'gulp-svg-sprite' );
const concat = require( 'gulp-concat' );
// Use terser minifier with gulp-uglify for ES2015 support.
const composer = require( 'gulp-uglify/composer' );
const terser = require( 'terser' );
const minify = composer( terser, console );
const cheerio = require( 'gulp-cheerio' );
const srihash = require( 'gulp-sri-hash' );
const sitemap = require( 'gulp-sitemap' );
const sourcemaps = require( 'gulp-sourcemaps' );
const GhostContentAPI = require( '@tryghost/content-api' );
const data = require( 'gulp-data' );

const paths = {
	html: {
		src: [ '**/*.mustache', '!partials/**', '!portfolio/**', '!node_modules/**/*' ],
		dest: './',
		watch: '**/*.mustache'
	},
	portfolio: {
		indexTemplate: 'portfolio/index.mustache',
		postTemplate: 'portfolio/_postTemplate/index.mustache',
		dest: 'portfolio/'
	},
	styles: {
		src: [
			'assets/styles/**/*.css',
			'!assets/styles/build/**',
			'!assets/styles/variables.css',
			'!assets/styles/partials/_*'
		],
		dest: 'assets/styles/build/',
		watch: [ 'assets/styles/**/*.css', '!assets/styles/build/**' ]
	},
	sprites: {
		src: [
			'assets/images/social-icons/*.svg',
			'!assets/images/social-icons/build/**'
		],
		dest: 'assets/images/social-icons'
	},
	scripts: {
		src: [
			'assets/scripts/*.js',
			'!assets/scripts/build/**',
			'!assets/scripts/main.js',
			'!assets/scripts/home.js',
			'!assets/scripts/social-icons.js'
		],
		dest: 'assets/scripts/build/',
		watch: 'assets/scripts/*.js'
	},
	globalScript: 'assets/scripts/global.js',
	homeScript: [
		'node_modules/boomsvgloader/dist/js/boomsvgloader.js',
		'assets/scripts/home.js'
	],
	socialIconsScript: [
		'node_modules/flickity/dist/flickity.pkgd.js',
		'assets/scripts/social-icons.js'
	],
	sri: {
		src: [ '**/*.html', '!node_modules/**' ],
		dest: './'
	},
	sitemap: {
		src: [ '**/*.html', '!error/*.html', '!node_modules/**/*' ],
		dest: './'
	}
};

const portfolioApi = new GhostContentAPI( {
	url: 'https://admin.scotthsmith.com',
	key: process.env.GHOST_CONTENT_API_KEY || '3c9b466022897c26d47c15c2a5',
	version: 'v2'
} );

const processors = [
	require( 'postcss-import' ),
	require( 'postcss-nested' ),
	require( 'postcss-custom-properties' ),
	require( 'postcss-normalize' )( { forceImport: true } ),
	require( 'css-mqpacker' )( { sort: true } ),
	require( 'autoprefixer' )
];

// Tasks
function html() {
	return gulp
		.src( paths.html.src )
		.pipe( mustache( {}, { extension: '.html' } ) )
		.pipe( gulp.dest( paths.html.dest ) );
}

function styles() {
	processors.push( require( 'cssnano' )( { preset: 'default' } ) );

	return gulp
		.src( paths.styles.src )
		.pipe( sourcemaps.init() )
		.pipe( postcss( processors ) )
		.pipe( sourcemaps.write( './' ) )
		.pipe( gulp.dest( paths.styles.dest ) );
}

function camelize( str ) {
	// from: https://stackoverflow.com/a/2970667
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index == 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

function getPathUrl( url ) {
	const postUrl = new URL(url);
	return `/portfolio${postUrl.pathname}${postUrl.search}`;
}

async function getPortfolioData() {
	let posts = await getPortfolioPosts();
	let pages = await getPortfolioPages();

	const postsData = {
		featured: posts.featured,
		bin: posts.bin,
		pages: pages
	}
	return postsData;
}

async function getPortfolioPosts() {
	return portfolioApi.posts
		.browse( { include: 'tags' } )
		.then( posts => {
			let featuredPosts = {};
			let binPosts = [];
			posts.forEach( post => {
				if ( post.featured ) {
					const index = camelize(post.slug).replace( '-', '' )
					post.url = getPathUrl( post.url )
					featuredPosts[index] = post
				} else {
					post.url = getPathUrl( post.url )
					binPosts.push( post )
				}
			} );
			const postsData = {
				featured: featuredPosts,
				bin: binPosts
			}
			return postsData;
		} )
		.catch( err => {
			console.error( err );
		} );
}

async function getPortfolioPages() {
	return portfolioApi.pages
		.browse()
		.then( pages => {
			let pagesSaved = [];
			pages.forEach( page => {
				page.url = getPathUrl( page.url )
				pagesSaved.push( page )
			} );
			return pagesSaved;
		} )
		.catch( err => {
			console.error( err );
		} );
}

async function portfolioIndex() {
	const portfolioData = await getPortfolioData();

	return gulp
		.src( paths.portfolio.indexTemplate )
		.pipe( data( portfolioData ) )
		.pipe( mustache({}, { extension: '.html' }) )
		.pipe( gulp.dest( paths.portfolio.dest ) );
		
}

async function portfolioPosts() {
	const portfolioData = await getPortfolioData();
	let posts = [];
	Object.entries(portfolioData.featured ).forEach( ( [ title, content] ) => { posts.push( content ) } );
	posts = posts.concat( portfolioData.bin, portfolioData.pages );

	posts.map( ( post ) => {
		return gulp.src( paths.portfolio.postTemplate )
			.pipe( data( { post: post, bin: portfolioData.bin } ) )
			.pipe( mustache({}, { extension: '.html' }) )
			.pipe( gulp.dest( `${paths.portfolio.dest}${post.slug}` ) );
	})
}

const portfolio = gulp.parallel(portfolioIndex, portfolioPosts);

function stylesForLint() {
	return gulp
		.src( paths.styles.src )
		.pipe( postcss( processors ) )
		.pipe( gulp.dest( paths.styles.dest ) );
}

function sprites() {
	const options = {
		shape: {
			transform: [
				{
					svgo: {
						plugins: [ { removeRasterImages: true } ]
					}
				}
			]
		},
		mode: {
			symbol: {
				// Create a «symbol» sprite.
				inline: true,
				dest: '.', // Don't create 'symbols/' directory.
				prefix: '', // Don't prefix output title.
				sprite: 'build/home-sprite' // '.svg' will be appended if not included.
			}
		}
	};

	return gulp
		.src( paths.sprites.src )
		.pipe( sprite( options ) )
		.pipe( gulp.dest( paths.sprites.dest ) );
}

function globalScript() {
	return gulp
		.src( paths.globalScript )
		.pipe( sourcemaps.init() )
		.pipe( concat( 'global.js' ) )
		.pipe( minify() )
		.pipe( sourcemaps.write( './' ) )
		.pipe( gulp.dest( paths.scripts.dest ) );
}

function homeScript() {
	return gulp
		.src( paths.homeScript )
		.pipe( sourcemaps.init() )
		.pipe( concat( 'home.js' ) )
		.pipe( minify() )
		.pipe( sourcemaps.write( './' ) )
		.pipe( gulp.dest( paths.scripts.dest ) );
}

function socialIconsScript() {
	return gulp
		.src( paths.socialIconsScript )
		.pipe( sourcemaps.init() )
		.pipe( concat( 'social-icons.js' ) )
		.pipe( minify() )
		.pipe( sourcemaps.write( './' ) )
		.pipe( gulp.dest( paths.scripts.dest ) );
}

const scripts = gulp.parallel(
	globalScript,
	homeScript,
	socialIconsScript,
	function normalScripts( done ) {
		return gulp
			.src( paths.scripts.src )
			.pipe( sourcemaps.init() )
			.pipe( minify() )
			.pipe( sourcemaps.write( './' ) )
			.pipe( gulp.dest( paths.scripts.dest ) );
		done();
	}
);

function sri() {
	return gulp
		.src( paths.sri.src )
		.pipe(
			srihash( {
				algo: 'sha512',
				selector: 'link[href][rel=stylesheet], script[src]'
			} )
		)
		.pipe(
			cheerio( {
				run: ( $, file, done ) => {
					$(
						'link[href][rel=stylesheet][integrity], script[src][integrity]'
					).each( function () {
						if ( isLocalPath( this ) ) {
							const refAttr = findRef( this );
							let initRef = $( this ).attr( refAttr );

							// Remove any extant query strings.
							if ( refAttr != null && initRef.includes( '?' ) ) {
								initRef = initRef.substr( 0, initRef.indexOf( '?' ) );
							}

							const hash = $( this ).attr( 'integrity' );
							if ( hash ) {
								const hashDigest = hash.slice( 7, 15 ); // Obtain a digest of the first eight chars of hash.

								const queriedRef = `${ initRef }?${ hashDigest }`;
								$( this ).attr( refAttr, queriedRef );
							}
						}

						function findRef( node ) {
							if ( node.name == 'link' ) {
								return 'href';
							} else if ( node.name == 'script' ) {
								return 'src';
							} else {
								return null;
							}
						}

						function isLocalPath( node ) {
							let src =
								node.name == 'script' ? node.attribs.src : node.attribs.href;

							if ( !src ) {
								return null;
							}

							// Ignore paths that look like like urls as they cannot be resolved on local filesystem.
							if ( src.match( /^(https?:)?\/\// ) ) {
								return null;
							}

							return src;
						}
					} );

					done();
				}
			} )
		)
		.pipe( gulp.dest( paths.sri.dest ) );
}

function makeSitemap() {
	return gulp
		.src( paths.sitemap.src )
		.pipe(
			sitemap( {
				siteUrl: 'https://scotthsmith.com'
			} )
		)
		.pipe( gulp.dest( paths.sitemap.dest ) );
}

function watch() {
	gulp.watch( paths.html.watch, gulp.series( html, sri ) );
	gulp.watch( paths.styles.watch, gulp.series( styles, sri ) );
	gulp.watch( paths.sprites.src, sprites );
	gulp.watch( paths.scripts.watch, gulp.series( scripts, sri ) );
}

// Workflows
// $ gulp: Builds, prefixes, and minifies CSS files; concencates and minifies JS files; watches for changes. The works.
const defaultTask = gulp.series(
	gulp.parallel( html, portfolio, styles, sprites, scripts ),
	sri,
	watch
);

// $ gulp build: Builds, prefixes, and minifies CSS files; concencates and minifies JS files. For deployments.
const buildTask = gulp.series(
	gulp.parallel( html, portfolio, styles, sprites, scripts ),
	sri
);

// $ gulp test: Runs stylelint against built CSS files. For CI.
const pretestTask = gulp.parallel( stylesForLint );

// Exports
// Externalise individual tasks.
exports.html = html;
exports.portfolio = portfolio;
exports.styles = styles;
exports.sprites = sprites;
exports.scripts = scripts;
exports.sri = sri;
exports.sitemap = makeSitemap;
exports.watch = watch;

// Externalise Workflows.
exports.build = buildTask;
exports.pretest = pretestTask;
exports.default = defaultTask;
