'use strict';

const gulp       = require('gulp');
const mustache   = require('gulp-mustache');
const postcss    = require('gulp-postcss');
const sprite     = require('gulp-svg-sprite');
const concat     = require('gulp-concat');
// Use uglify-es minifier with gulp-uglify for ES2015 support.
const composer   = require('gulp-uglify/composer');
const uglifyes   = require('uglify-es');
const minify     = composer(uglifyes, console);
const cheerio    = require('gulp-cheerio');
const srihash    = require('gulp-sri-hash');
const sitemap    = require('gulp-sitemap');
const sourcemaps = require('gulp-sourcemaps');

const paths = {
	html: {
		src: ['**/*.mustache', '!partials/**', '!node_modules/**/*'],
		dest: './',
		watch: '**/*.mustache'
	},
	styles: {
		src: ['assets/styles/**/*.css', '!assets/styles/build/**', '!assets/styles/variables.css', '!assets/styles/partials/_*'],
		dest: 'assets/styles/build/',
		watch: ['assets/styles/**/*.css', '!assets/styles/build/**']
	},
	teaStyles: {
		src: 'tea/*.css',
		dest: 'tea/build/'
	},
	sprites: {
		src: ['assets/images/social-icons/*.svg', '!assets/images/social-icons/build/**'],
		dest: 'assets/images/social-icons'
	},
	scripts: {
		src: ['assets/scripts/*.js', '!assets/scripts/build/**', '!assets/scripts/main.js', '!assets/scripts/home.js', '!assets/scripts/social-icons.js'],
		dest: 'assets/scripts/build/',
		watch: 'assets/scripts/*.js'
	},
	globalScript:      ['assets/scripts/global.js', 'assets/scripts/vendor/modernizr.js'],
	homeScript:        ['node_modules/boomsvgloader/dist/js/boomsvgloader.js', 'assets/scripts/home.js'],
	socialIconsScript: ['node_modules/flickity/dist/flickity.pkgd.js', 'assets/scripts/social-icons.js'],
	sri: {
		src: ['**/*.html', '!tea/**', '!node_modules/**'],
		dest: './'
	},
	sitemap: {
		src: ['**/*.html', '!error/*.html', '!node_modules/**/*'],
		dest: './'
	}
};

const processors = [
	require('postcss-import'),
	require('postcss-nested'),
	require('postcss-custom-properties'),
	require('postcss-normalize')({forceImport: true}),
	require('css-mqpacker')({sort: true}),
	require('autoprefixer')
];

// Tasks
function html() {
	return gulp.src(paths.html.src)
		.pipe(mustache({},{'extension': '.html'}))
		.pipe(gulp.dest(paths.html.dest))
}

function styles() {
	processors.push(require('cssnano')({preset: 'default'}));
	
	return gulp.src(paths.styles.src)
		.pipe(sourcemaps.init())
			.pipe(postcss(processors))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.styles.dest));
}

function teaStyles() {
	return gulp.src(paths.teaStyles.src)
		.pipe(sourcemaps.init())
			.pipe(postcss(processors))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.teaStyles.dest));
}

function stylesForLint() {
	return gulp.src(paths.styles.src)
		.pipe(postcss(processors))
		.pipe(gulp.dest(paths.styles.dest));
}

function sprites() {
	const options = {
		shape: {
			transform: [{
            	svgo: {
	            	plugins: [
	            		{ removeRasterImages: true }
	            	]
	            }
			}]
		},
		mode: {
			symbol: { // Create a «symbol» sprite.
				inline: true,
				dest: '.', // Don't create 'symbols/' directory.
				prefix: '', // Don't prefix output title.
				sprite: 'build/home-sprite' // '.svg' will be appended if not included.
			}
		} 
	};
    
	return gulp.src(paths.sprites.src)
		.pipe(sprite(options))
		.pipe(gulp.dest(paths.sprites.dest));
}

function globalScript() {
	return gulp.src(paths.globalScript)
		.pipe(sourcemaps.init())
			.pipe(concat('global.js'))
			.pipe(minify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest));
}

function homeScript() {
	return gulp.src(paths.homeScript)
		.pipe(sourcemaps.init())
			.pipe(concat('home.js'))
			.pipe(minify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest));
}

function socialIconsScript() {
	return gulp.src(paths.socialIconsScript)
		.pipe(sourcemaps.init())
			.pipe(concat('social-icons.js'))
			.pipe(minify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest));
}

const scripts = gulp.parallel(globalScript, homeScript, socialIconsScript, function normalScripts(done) {
	return gulp.src(paths.scripts.src)
		.pipe(sourcemaps.init())
			.pipe(minify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest));
	done();
})

function sri() {
	return gulp.src(paths.sri.src)
		// Remove integrity attributes to reset.
		.pipe(cheerio({
			run: ($, file, done) => {
				$('link[href][rel=stylesheet], script[src]').each( function() {
					if (isLocalPath(this)) {
						$(this).removeAttr('integrity', 'crossorigin');
					}
	
					function isLocalPath(node) {
						let src = node.name == 'script' ? node.attribs.src : node.attribs.href;
						
						if (!src) {
							return null;
						}
						
						// Ignore paths that look like like urls as they cannot be resolved on local filesystem.
						if (src.match(/^(https?:)?\/\//)) {
							return null;
						}
						
						return src;
					}
				});
				done();
			}
		}))
		.pipe(srihash({
			algo: 'sha512'
		}))
		.pipe(cheerio({
			run: ($, file, done) => {
				$('link[href][rel=stylesheet][integrity], script[src][integrity]').each( function() {
					if (isLocalPath(this)) {
						const refAttr = findRef(this);
						let initRef = $(this).attr(refAttr);
						
						// Remove any extant query strings.
						if (refAttr != null && initRef.includes('?')) {
							initRef = initRef.substr(0, initRef.indexOf('?'));
						}
						
						let hash = $(this).attr('integrity');
						let hashDigest = hash.slice(7, 15); // Obtain a digest of the first eight chars of hash.
						
						let queriedRef = `${initRef}?${hashDigest}`;
						$(this).attr(refAttr, queriedRef);
					}
					
					function findRef(node) {
						if (node.name == 'link') {
							return 'href';
						} else if (node.name == 'script') {
							return 'src';
						} else {
							return null;
						}
					}
	
					function isLocalPath(node) {
						let src = node.name == 'script' ? node.attribs.src : node.attribs.href;
						
						if (!src) {
							return null;
						}
						
						// Ignore paths that look like like urls as they cannot be resolved on local filesystem.
						if (src.match(/^(https?:)?\/\//)) {
							return null;
						}
						
						return src;
					}
				});
				
				done();
			}
		}))
		.pipe(gulp.dest(paths.sri.dest));
	done();
}

function makeSitemap() {
	return gulp.src(paths.sitemap.src)
		.pipe(sitemap({
			siteUrl: 'https://scotthsmith.com'
		}))
		.pipe(gulp.dest(paths.sitemap.dest));
}

function watch() {
	gulp.watch(paths.html.watch, gulp.series(html, sri));
	gulp.watch(paths.styles.watch, gulp.series(styles, sri));
	gulp.watch(paths.sprites.src, sprites);
	gulp.watch(paths.scripts.watch, gulp.series(scripts, sri));
}

// Workflows
// $ gulp: Builds, prefixes, and minifies CSS files; concencates and minifies JS files; watches for changes. The works.
const defaultTask = gulp.series(gulp.parallel(html, styles, teaStyles, sprites, scripts), sri, watch);

// $ gulp build: Builds, prefixes, and minifies CSS files; concencates and minifies JS files. For deployments.
const buildTask = gulp.series(gulp.parallel(html, styles, teaStyles, sprites, scripts), sri);

// $ gulp test: Runs stylelint against built CSS files. For CI.
const pretestTask = gulp.parallel(stylesForLint);

// Exports
// Externalise individual tasks.
exports.html = html;
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