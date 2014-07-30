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
					flatten: true,
					cwd: 'css/',
					src: ['*.scss'],
					dest: 'css/',
				}]
			},
			comb_tea: {
				build: [{
					expand: true,
					flatten: true,
					cwd: 'tea/',
					src: ['*.scss'],
					dest: 'tea/',
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
					flatten: true,
					cwd: 'css/',
					src: ['*.scss'],
					dest: 'css/build/',
					ext: '.css'
				}]
			},
			build_tea: {
				files: [{
					expand: true,
					flatten: true,
					cwd: 'tea/',
					src: ['*.scss'],
					dest: 'tea/',
					ext: '.css'
				}]
			}
		},
        
		autoprefixer: {
            options: {
				browsers: ['> 1%', 'last 2 versions', 'ie 9', 'ie 8', 'firefox 24', 'opera 12.1'],
				map: true
			},
			prefix_main: {
				expand: true,
				flatten: true,
				cwd: 'css/build/',
				src: ['*.css'],
				dest: 'css/build/',
			},
			prefix_tea: {
				expand: true,
				flatten: true,
				cwd: 'tea/',
				src: ['*.css'],
				dest: 'tea/',
			}
		},
		
		cssmin: {
			minify_main: {
				expand: true,
				flatten: true,
				cwd: 'css/build/',
				src: ['*.css'],
				dest: 'css/build/',
			},
			minify_tea: {
				expand: true,
				flatten: true,
				cwd: 'tea/',
				src: ['*.css'],
				dest: 'tea/',
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
				"matchCommunityTests": false,
			}
		},
		
		uglify: {
			options: {
				sourceMap: true
			},
			build_main: {
				files: {
					'scripts/build/main.js': ['scripts/modernizr.js', 'bower_components/fastclick/lib/fastclick.js', 'scripts/main.js'],
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
				tasks: ['csscomb, sass', 'autoprefixer'],
				options: {
					spawn: false
				}
			},
			scripts: {
				files: ['scripts/*.js'],
				tasks: ['uglify'],
				options: {
					spawn: false
				}
			},
			images: {
				files: ['images/**/*.jpg', 'images/**/*.png'],
				tasks: ['newer:imageoptim'],
				options: {
					spawn: false
				}
			},
			livereload: {
				options: { livereload: true },
				files: ['**/*.html', 'css/*.scss', 'scripts/*.js', 'images/**/*.jpg', 'images/**/*.png'],
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
	grunt.registerTask('default', ['csscomb', 'sass', 'autoprefixer', 'cssmin' , 'modernizr', 'uglify', 'newer:imageoptim']);
		
	// $ grunt dev: Watches for changes while developing
	grunt.registerTask('dev', ['watch']);

};