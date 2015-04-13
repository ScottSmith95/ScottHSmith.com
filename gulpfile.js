var gulp         = require('gulp'),
	csscomb      = require('gulp-csscomb'),
	sass         = require('gulp-sass'),
	postcss      = require('gulp-postcss'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify'),
	sourcemaps   = require('gulp-sourcemaps');

var paths = {
	styles:     'css/*.scss',
	scripts:    ['scripts/modernizr.js', 'bower_components/fastclick/lib/fastclick.js', 'scripts/main.js'],
	teastyles: 'tea/*.scss'
};

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

gulp.task('watch', function() {
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.teastyles, ['teastyles']);
});

// Workflows
// $ gulp: Builds, prefixes, and minifies CSS files; concencates and minifies JS files; watches for changes. The works.
gulp.task('default', ['styles', 'scripts', 'teastyles', 'watch']);

// $ gulp build: Builds, prefixes, and minifies CSS files; concencates and minifies JS files. For deployments.
gulp.task('build', ['styles', 'scripts', 'teastyles']);