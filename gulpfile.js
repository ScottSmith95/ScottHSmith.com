var gulp       = require('gulp'),
	merge      = require('merge-stream'),
	kit        = require('gulp-kit'),
	postcss    = require('gulp-postcss'),
	concat     = require('gulp-concat'),
	uglify     = require('gulp-uglify'),
	sitemap    = require('gulp-sitemap'),
	sourcemaps = require('gulp-sourcemaps');

var paths = {
	html:             ['**/*.kit', '!kit-includes/**', '!bower_components/**/*', '!node_modules/**/*'],
	styles:           'css/*.css',
	teaStyles:        'tea/*.css',
	mainScripts:      ['scripts/modernizr.js', 'bower_components/fastclick/lib/fastclick.js', 'scripts/main.js'],
	portfolioScripts: ['bower_components/imagesloaded/imagesloaded.pkgd.min.js', 'bower_components/masonry/dist/masonry.pkgd.min.js', 'scripts/portfolio.js'],
	sitemap:          ['**/*.html', '!error/*.html', '!bower_components/**/*', '!node_modules/**/*']
};

gulp.task('html', function(){
	return gulp.src(paths.html)
		.pipe(kit())
		.pipe(gulp.dest('./'));
});

gulp.task('styles', function() {
	var processors = [
		require('postcss-import'),
		require('postcss-nested'),
		require('postcss-simple-vars'),
		require('css-mqpacker'),
		require('autoprefixer-core')('last 2 versions', '> 1%', 'ie 9', 'ie 8', 'Firefox ESR'),
		require('csswring')
    ];
	var mainStyles = gulp.src(paths.styles)
		.pipe(sourcemaps.init())
			.pipe(postcss(processors))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('css/build/'));
		
	var teaStyles =  gulp.src(paths.teaStyles)
		.pipe(sourcemaps.init())
			.pipe(postcss(processors))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('tea/'));
		
	return merge(mainStyles, teaStyles);
});

gulp.task('scripts', function() {
	var portfolioScript = gulp.src(paths.portfolioScripts)
		.pipe(sourcemaps.init())
			.pipe(concat('portfolio.js'))
			.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('scripts/build/'));

	var mainScript = gulp.src(paths.mainScripts)
		.pipe(sourcemaps.init())
			.pipe(concat('main.js'))
			.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('scripts/build/'));
		
	return merge(mainScript, portfolioScript);
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
	gulp.watch([paths.styles, paths.teaStyles], ['styles']);
	gulp.watch([paths.mainScripts, paths.portfolioScripts], ['scripts']);
});

// Workflows
// $ gulp: Builds, prefixes, and minifies CSS files; concencates and minifies JS files; watches for changes. The works.
gulp.task('default', ['html', 'styles', 'scripts', 'sitemap', 'watch']);

// $ gulp build: Builds, prefixes, and minifies CSS files; concencates and minifies JS files. For deployments.
gulp.task('build', ['html', 'styles', 'scripts', 'sitemap']);