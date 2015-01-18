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
		}
    });
    
    // Plugin List
    grunt.loadNpmTasks("grunt-modernizr");

	// Workflows
	// $ grunt: Concencates, prefixes, minifies JS and CSS files. The works.
	grunt.registerTask('default', [
		'modernizr',
		'watch'
	]);
	
};