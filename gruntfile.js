module.exports = function(grunt) {

	// Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		csscomb: {
			options: {
				config: 'csscomb.json'
			},
			comb_main: {
				build: [{
					expand: true,
					src: ['css/*.scss']
				}]
			},
			comb_tea: {
				build: [{
					expand: true,
					src: ['tea/*.scss']
				}]
			},
		},
		
		sass: {
			options: {
				outputStyle: 'nested',
				sourceMap: true
			},
			build_main: {
				files: [{
					expand: true,
					cwd: 'css/',
					src: ['*.scss'],
					dest: 'css/build/',
					ext: '.css'
				}]
			},
			build_tea: {
				files: [{
					expand: true,
					src: ['tea/*.scss'],
					ext: '.css'
				}]
			}
		},
        
		autoprefixer: {
            options: {
				browsers: ['> 1%', 'last 2 versions', 'ie 9', 'ie 8', 'Firefox ESR', 'Opera 12.1'],
				map: true
			},
			prefix_main: {
				expand: true,
				src: ['css/build/*.css']
			},
			prefix_tea: {
				expand: true,
				src: ['tea/*.css']
			}
		},
		
		cssmin: {
			minify_main: {
				expand: true,
				src: ['css/build/*.css']
			},
			minify_tea: {
				expand: true,
				src: ['tea/*.css']
			}
		},
		
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
		
		uglify: {
			options: {
				sourceMap: true
			},
			build_main: {
				files: {
					'scripts/build/main.js': ['scripts/modernizr.js', 'bower_components/fastclick/lib/fastclick.js', 'scripts/main.js']
				}
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

        watch: {
			styles: {
				files: ['css/*.scss'],
				tasks: ['csscomb', 'sass', 'autoprefixer', 'cssmin']
			},
			scripts: {
				files: ['scripts/*.js'],
				tasks: ['uglify']
			},
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
    grunt.loadNpmTasks('grunt-csscomb');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks("grunt-modernizr");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-imageoptim');
    grunt.loadNpmTasks('grunt-contrib-watch');

	// Workflows
	// $ grunt: Concencates, prefixes, minifies JS and CSS files. The works.
	grunt.registerTask('default', [
		'csscomb',
		'sass',
		'autoprefixer',
		'cssmin',
		'modernizr',
		'uglify',
		'newer:imageoptim',
		'watch'
	]);
		
	// $ grunt dev: Watches for changes while developing
	grunt.registerTask('dev', [
		'watch'
	]);

};