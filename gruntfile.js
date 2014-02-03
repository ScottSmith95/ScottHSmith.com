module.exports = function(grunt) {

	// Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		sass: {
			make: {
				options: {
					style: 'compressed'
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
				src: ['*.css'],
				dest: 'css/build/',
				ext: '.css'
			}
		},

        watch: {
			css: {
				files: ['css/*.scss', 'css/build/*.css'],
				tasks: ['sass', 'autoprefixer'],
				options: {
					spawn: false
				}
			},
			livereload: {
				options: { livereload: true },
				files: ['*.html', 'css/*.css'],
			}
		},
    });
    
    // Plugin List
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

	// Workflows
	// $ grunt: Concencates, prefixes, minifies JS and CSS files. The works.
	grunt.registerTask('default', ['sass', 'autoprefixer']);
		
	// $ grunt dev: Watches for changes while developing
	grunt.registerTask('dev', ['watch']);

};