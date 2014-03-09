module.exports = function(grunt) {

	// Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		sass: {
			make: {
				options: {
					style: 'compressed',
					sourcemap: true
				},
				files: [{
					expand: true,
					flatten: true,
					cwd: 'css/',
					src: ['*.scss'],
					dest: 'css/build/',
					ext: '.sassed.css'
				}]
			}
		},
        
		autoprefixer: {
            options: {
				browsers: ['> 1%', 'last 2 versions', 'ie 9', 'ie 8', 'firefox 24', 'opera 12.1'],
				map: true
			},
			prefix: {
				expand: true,
				flatten: true,
				cwd: 'css/build/',
				src: ['*.sassed.css'],
				dest: 'css/build/',
				ext: '.css'
			}
		},
		
		modernizr: {
			makefile: {
				"devFile": "scripts/src/modernizr-dev.js",
				"outputFile": "scripts/src/modernizr.js",
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
		
		'jsmin-sourcemap': {
			minify: {
				src: ['scripts/src/fastclick.js', 'scripts/src/modernizr.js', 'scripts/src/main.js'],
				srcRoot: '/',
				dest: 'scripts/main.js',
				destMap: 'scripts/srcmap/main.js.map'
			}
		},

        watch: {
			css: {
				files: ['css/*.scss'],
				tasks: ['sass', 'autoprefixer'],
				options: {
					spawn: false
				}
			},
			livereload: {
				options: { livereload: true },
				files: ['**.html', 'css/*.scss'],
			}
		},
    });
    
    // Plugin List
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks("grunt-modernizr");
    grunt.loadNpmTasks('grunt-jsmin-sourcemap');
    grunt.loadNpmTasks('grunt-contrib-watch');

	// Workflows
	// $ grunt: Concencates, prefixes, minifies JS and CSS files. The works.
	grunt.registerTask('default', ['sass', 'autoprefixer', 'modernizr', 'jsmin-sourcemap']);
		
	// $ grunt dev: Watches for changes while developing
	grunt.registerTask('dev', ['watch']);

};