'use strict';

var gulp       = require('gulp'),
	kit        = require('gulp-kit'),
	postcss    = require('gulp-postcss'),
	sprite     = require('gulp-svg-sprite'),
	concat     = require('gulp-concat'),
	uglify     = require('gulp-uglify'),
	sitemap    = require('gulp-sitemap'),
	sourcemaps = require('gulp-sourcemaps');

var paths = {
	html:              {
		src: ['**/*.kit', '!kit-includes/**', '!node_modules/**/*'],
		dest: './'
	},
	styles:            {
		src: ['styles/**/*.css', '!styles/build/**', '!styles/variables.css', '!styles/partials/_*'],
		dest: 'styles/build/'
	},
	teaStyles:         {
		src: 'tea/*.css',
		dest: 'tea/build/'
	},
	builtStyles:       {
		src: 'styles/build/home.css'
	},
	sprites:           {
		src: ['images/Social Icons/*.svg', '!images/Social Icons/home-sprite.svg'],
		dest: 'images/Social Icons'
	},
	sitemap:           {
		src: ['**/*.html', '!error/*.html', '!node_modules/**/*'],
		dest: './'
	},
	scripts:           {
		src: ['scripts/*.js', '!scripts/build/**', '!scripts/main.js', '!scripts/home.js', '!scripts/social-icons.js'],
		dest: 'scripts/build/',
		watch: 'scripts/*.js'
	},
	mainScript:        ['scripts/vendor/modernizr.js'],
	homeScript:        ['node_modules/boomsvgloader/dist/js/boomsvgloader.js', 'scripts/home.js'],
	socialIconsScript: ['node_modules/flickity/dist/flickity.pkgd.js', 'scripts/social-icons.js']
};

var processors = [
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
		.pipe(kit())
		.pipe(gulp.dest(paths.html.dest));
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

function lintStyles() {
	return gulp.src(paths.styles.src)
		.pipe(postcss(processors))
		.pipe(gulp.dest(paths.styles.dest));
}

function lint() {
	return gulp.src(paths.builtStyles.src)
		.pipe(lint({
			failAfterError: false,
			reporters: {
				formatter: 'string',
				save: 'report.txt'
			},
			debug: true
	    }));
}

function sprites() {
	var options = {
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

function mainScript() {
	return gulp.src(paths.mainScript)
		.pipe(sourcemaps.init())
			.pipe(concat('main.js'))
			.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest));
}

function homeScript() {
	return gulp.src(paths.homeScript)
		.pipe(sourcemaps.init())
			.pipe(concat('home.js'))
			.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest));
}

function socialIconsScript() {
	return gulp.src(paths.socialIconsScript)
		.pipe(sourcemaps.init())
			.pipe(concat('social-icons.js'))
			.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('scripts/build/'));
}

var scripts = gulp.parallel(mainScript, homeScript, socialIconsScript, function normalScripts(done) {
	return gulp.src(paths.scripts.src)
		.pipe(sourcemaps.init())
			.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest));
	done();
})

function sitemap() {
	return gulp.src(paths.sitemap.src)
		.pipe(sitemap({
			siteUrl: 'https://scotthsmith.com'
		}))
		.pipe(gulp.dest(paths.sitemap.dest));
}

function watch() {
	gulp.watch(paths.html.src, html);
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.sprites.src, sprites);
	gulp.watch(paths.scripts.watch, scripts);
}

// Workflows
// $ gulp: Builds, prefixes, and minifies CSS files; concencates and minifies JS files; watches for changes. The works.
var defaultTask = gulp.parallel(html, styles, teaStyles, sprites, scripts, watch);

// $ gulp build: Builds, prefixes, and minifies CSS files; concencates and minifies JS files. For deployments.
var buildTask = gulp.parallel(html, styles, teaStyles, sprites, scripts);

// $ gulp test: Runs stylelint against built CSS files. For CI.
var pretestTask = gulp.parallel(lintStyles);

// Exports
// Externalise individual tasks.
exports.html = html;
exports.styles = styles;
exports.lint = lint;
exports.sprites = sprites;
exports.scripts = scripts;
exports.sitemap = sitemap;
exports.watch = watch;

// Externalise Workflows.
exports.build = buildTask;
exports.prestest = pretestTask;
exports.default = defaultTask;