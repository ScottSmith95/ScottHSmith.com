var gulp       = require('gulp'),
	kit        = require('gulp-kit'),
	postcss    = require('gulp-postcss'),
	uglify     = require('gulp-uglify'),
	sitemap    = require('gulp-sitemap'),
	sourcemaps = require('gulp-sourcemaps');

var paths = {
	html:             ['**/*.kit', '!kit-includes/**', '!node_modules/**/*'],
	styles:           ['styles/**/*.css', '!styles/build/**', '!styles/variables.css'],
	teaStyles:        'tea/*.css',
	scripts:          ['scripts/*.js', '!scripts/build/**'],
	sitemap:          ['**/*.html', '!error/*.html', '!node_modules/**/*']
};

var processors = [
	require('postcss-import'),
	require('postcss-nested'),
	require('postcss-custom-properties'),
	require('css-mqpacker')({sort: true}),
	require('autoprefixer')('last 2 versions', '> 1%', 'ie 9', 'ie 8', 'Firefox ESR'),
	require('cssnano')({autoprefixer: false})
];

gulp.task('html', function(){
	return gulp.src(paths.html)
		.pipe(kit())
		.pipe(gulp.dest('./'));
});

gulp.task('styles', function() {
	return gulp.src(paths.styles)
		.pipe(sourcemaps.init())
			.pipe(postcss(processors))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('styles/build/'));
});

gulp.task('teaStyles', function() {
	return gulp.src(paths.teaStyles)
		.pipe(sourcemaps.init())
			.pipe(postcss(processors))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('tea/build/'));
});

gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
			.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('scripts/build/'));
});

gulp.task('sitemap', ['html'], function () {
	return gulp.src(paths.sitemap)
		.pipe(sitemap({
			siteUrl: 'https://scotthsmith.com'
		}))
		.pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
	gulp.watch(paths.html, ['html']);
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.scripts, ['scripts']);
});

// Workflows
// $ gulp: Builds, prefixes, and minifies CSS files; concencates and minifies JS files; watches for changes. The works.
gulp.task('default', ['html', 'styles', 'teaStyles', 'scripts', 'sitemap', 'watch']);

// $ gulp build: Builds, prefixes, and minifies CSS files; concencates and minifies JS files. For deployments.
gulp.task('build', ['html', 'styles', 'teaStyles', 'scripts', 'sitemap']);