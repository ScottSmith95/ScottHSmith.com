module.exports = function(grunt) {

    // Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
		autoprefixer: {
            options: {
				browsers: ['> 1%', 'last 2 versions', 'ie 9', 'ie 8', 'firefox 24', 'opera 12.1'],
				map: true
			},
			prefix: {
				expand: true,
				flatten: true,
				cwd: 'css/',
				src: ['*.css'],
				dest: 'css/build/',
				ext: '.prefixed.css'
			}
		},

        watch: {
			css: {
				files: ['css/*.css'],
				tasks: ['autoprefixer'],
				options: {
					spawn: false
				}
			},
			livereload: {
				options: { livereload: true },
				files: ['index.html', 'css/**'],
			}
		},
    });
    
    // Plugin List
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

	// Workflows
	// $ grunt: Concencates, prefixes, minifies JS and CSS files. The works.
	grunt.registerTask('default', ['autoprefixer']);
		
	// $ grunt dev: Watches for changes while developing
	grunt.registerTask('dev', ['watch']);

};