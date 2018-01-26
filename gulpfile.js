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
const sitemap    = require('gulp-sitemap');
const sourcemaps = require('gulp-sourcemaps');

const paths = {
	html: {
		src: ['**/*.mustache', '!partials/**', '!node_modules/**/*'],
		dest: './',
		watch: '**/*.mustache'
	},
	styles: {
		src: ['styles/**/*.css', '!styles/build/**', '!styles/variables.css', '!styles/partials/_*'],
		dest: 'styles/build/',
		watch: ['styles/**/*.css', '!styles/build/**']
	},
	teaStyles: {
		src: 'tea/*.css',
		dest: 'tea/build/'
	},
	sprites: {
		src: ['images/Social Icons/*.svg', '!images/Social Icons/home-sprite.svg'],
		dest: 'images/Social Icons'
	},
	sitemap: {
		src: ['**/*.html', '!error/*.html', '!node_modules/**/*'],
		dest: './'
	},
	scripts: {
		src: ['scripts/*.js', '!scripts/build/**', '!scripts/main.js', '!scripts/home.js', '!scripts/social-icons.js'],
		dest: 'scripts/build/',
		watch: 'scripts/*.js'
	},
	globalScript:      ['scripts/global.js', 'scripts/vendor/modernizr.js'],
	homeScript:        ['node_modules/boomsvgloader/dist/js/boomsvgloader.js', 'scripts/home.js'],
	socialIconsScript: ['node_modules/flickity/dist/flickity.pkgd.js', 'scripts/social-icons.js']
};

const processors = [
	require('postcss-import'),
	require('postcss-nested'),
	require('postcss-custom-properties'),
	require('postcss-normalize'),
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
	processors.push(require('cssnano')({autoprefixer: false, reduceIdents: false}));
	
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
			transform       : [
            	{svgo       : {
	            	plugins : [
	            		{removeTitle: true}
	            	]
	            }}
			]
		},
		mode: {
			symbol: { // Create a «symbol» sprite.
				dest: '.', // Don't create 'symbols/' directory.
				prefix: '', // Don't prefix output title.
				sprite: 'home-sprite' // '.svg' will be appended if not included.
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

var scripts = gulp.parallel(globalScript, homeScript, socialIconsScript, function normalScripts(done) {
	return gulp.src(paths.scripts.src)
		.pipe(sourcemaps.init())
			.pipe(minify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest));
	done();
})

function makeSitemap() {
	return gulp.src(paths.sitemap.src)
		.pipe(sitemap({
			siteUrl: 'https://scotthsmith.com'
		}))
		.pipe(gulp.dest(paths.sitemap.dest));
}

function watch() {
	gulp.watch(paths.html.watch, html);
	gulp.watch(paths.styles.watch, styles);
	gulp.watch(paths.sprites.src, sprites);
	gulp.watch(paths.scripts.watch, scripts);
}

// Workflows
// $ gulp: Builds, prefixes, and minifies CSS files; concencates and minifies JS files; watches for changes. The works.
const defaultTask = gulp.parallel(html, styles, teaStyles, sprites, scripts, watch);

// $ gulp build: Builds, prefixes, and minifies CSS files; concencates and minifies JS files. For deployments.
const buildTask = gulp.parallel(html, styles, teaStyles, sprites, scripts);

// $ gulp test: Runs stylelint against built CSS files. For CI.
const pretestTask = gulp.parallel(stylesForLint);

// Exports
// Externalise individual tasks.
exports.html = html;
exports.styles = styles;
exports.sprites = sprites;
exports.scripts = scripts;
exports.sitemap = makeSitemap;
exports.watch = watch;

// Externalise Workflows.
exports.build = buildTask;
exports.pretest = pretestTask;
exports.default = defaultTask;