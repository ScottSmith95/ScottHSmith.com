var gulp       = require('gulp'),
	kit        = require('gulp-kit'),
	csscomb    = require('gulp-csscomb'),
	sass       = require('gulp-sass'),
	postcss    = require('gulp-postcss'),
	concat     = require('gulp-concat'),
	uglify     = require('gulp-uglify'),
	sitemap    = require('gulp-sitemap'),
	sourcemaps = require('gulp-sourcemaps');

var paths = {
	html:      ['**/*.kit', '!kit-includes/**', '!node_modules/', '!bower_components/'],
	styles:    'css/*.scss',
	scripts:   ['scripts/modernizr.js', 'bower_components/fastclick/lib/fastclick.js', 'scripts/main.js'],
	teastyles: 'tea/*.scss'
};

gulp.task('html', function(){
	return gulp.src(paths.html)
		.pipe(kit())
		.pipe(gulp.dest('./'));
});

gulp.task('styles', function() {
	var processors = [
		require('autoprefixer-core')('last 2 versions', '> 1%', 'ie 9', 'ie 8', 'Firefox ESR'),
		require('css-mqpacker'),
		require('csswring')
    ];
	return gulp.src(paths.styles)
		.pipe(sourcemaps.init())
			.pipe(csscomb())
			.pipe(sass())
			.pipe(postcss(processors))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('css/build/'));
});

gulp.task('teastyles', function() {
	var processors = [
		require('autoprefixer-core')('last 2 versions', '> 1%', 'ie 9', 'ie 8', 'Firefox ESR'),
		require('css-mqpacker'),
		require('csswring')
    ];
	return gulp.src(paths.teastyles)
		.pipe(sourcemaps.init())
			.pipe(csscomb())
			.pipe(sass())
			.pipe(postcss(processors))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('tea/'));
});

gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
			.pipe(concat('main.js'))
			.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('scripts/build/'));
});

gulp.task('sitemap', ['html'], function () {
	return gulp.src(['**/*.html', '!error/*.html', '!bower_components/**/*.html', '!node_modules/**/*.html'])
		.pipe(sitemap({
			siteUrl: 'https://scotthsmith.com'
		}))
		.pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
	gulp.watch(paths.html, ['html']);
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.teastyles, ['teastyles']);
});

// Workflows
// $ gulp: Builds, prefixes, and minifies CSS files; concencates and minifies JS files; watches for changes. The works.
gulp.task('default', ['html', 'styles', 'scripts', 'teastyles', 'html', 'sitemap', 'watch']);

// $ gulp build: Builds, prefixes, and minifies CSS files; concencates and minifies JS files. For deployments.
gulp.task('build', ['html', 'styles', 'scripts', 'teastyles', 'html', 'sitemap']);