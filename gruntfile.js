module.exports = function(grunt) {

	// Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		modernizr: {
			makefile: {
				"devFile": "remote", // Skip check for dev file
				"outputFile": "scripts/modernizr.js",
				"extra": {
					"shiv": true,
					"printshiv": false,
					"load": false,
					"mq": false,
					"cssclasses": true
				},
				"extensibility": {
					"addtest": false,
					"prefixed": false,
					"teststyles": true,
					"testprops": true,
					"testallprops": true,
					"hasevents": false,
					"prefixes": true,
					"domprefixes": true
				},
				"uglify": false,
				"tests": ['flexbox', 'cssanimations', 'csscolumns', 'svg', 'touch'],
				"parseFiles": false,
				"matchCommunityTests": false
			}
		},
		
		imageoptim: {
			optimize: {
				src: ['images/**/*.jpg', 'images/**/*.png'],
				options: {
					jpegMini: false,
					imageAlpha: true,
					quitAfter: true
				}
			}
		},
		
		sitemap: {
			map: {
				siteRoot: './',
				homepage: 'http://scotthsmith.com/',
			}
		},

        watch: {
			images: {
				files: ['images/**/*.jpg', 'images/**/*.png'],
				tasks: ['newer:imageoptim']
			},
			livereload: {
				options: { livereload: true },
				files: ['**/*.html', 'css/*.scss', 'scripts/*.js', 'images/**/*.jpg', 'images/**/*.png']
			}
		},
    });
    
    // Plugin List
    grunt.loadNpmTasks("grunt-modernizr");
    grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-imageoptim');
	grunt.loadNpmTasks('grunt-sitemap');
    grunt.loadNpmTasks('grunt-contrib-watch');

	// Workflows
	// $ grunt: Concencates, prefixes, minifies JS and CSS files. The works.
	grunt.registerTask('default', [
		'modernizr',
		'newer:imageoptim',
		'sitemap',
		'watch'
	]);
		
	// $ grunt dev: Watches for changes while developing
	grunt.registerTask('dev', [
		'watch'
	]);

};