/*
	This is the grunt file used to build the project. 
	
	Credit where credit is due:
	
		A lot of the concepts around removing the AMD implementation and 
		building the final library were inspired by the excellent 
		Modernizer project (https://github.com/Modernizr/Modernizr).
*/

/*jshint node: true */
/*global module */
module.exports = function(grunt) 
{
	'use strict';
	
	var filesystem = require('fs');
	var path = require('path');
	
	var settings =
    {
        encoding: 'utf-8',
        eol: process.platform === 'win32' ? '\n\r' : '\n',
        pathDelimiter: process.platform == 'win32' ? '\\' : '/',
        defaultSourcePath: 'source/',
        defaultDestinationPath: 'build/'
    };
	
	// Project configuration.
	grunt.config.init(
		{
			pkg: grunt.file.readJSON('package.json'),
			banner: 
				{
					compact: '/*! <%= pkg.name %> <%= pkg.version %> (Custom Build) | <%= pkg.license %> */',
					full: 
						'/*!\n' +
						' * <%= pkg.name %> v<%= pkg.version %>\n' +
						' * Copyright (c) <%= _.pluck(pkg.contributors, "name").join(", ") %>\n' +
						' * <%= pkg.license %> License\n */' +
						' \n' +
						'/*\n' +
						' * Selectioner is a general purpose jQuery-based enhancement for HTML select boxes.\n' + 
						' * It was written with extensibility in mind, and comes with various pre-built\n' + 
						' * flavours, such as multi-selects and combo-boxes.\n */'
				},
			jshint: 
				{
					// See http://www.jshint.com/docs/options/ for option details.
					options: 
						{
							scripturl: true
						},
					all: ['gruntfile.js', 'source/*/*.js']
				},
			requirejs: 
				{
					compile: 
						{
							options: 
								{
									dir: 'build',
									appDir: 'source',
									baseUrl: '.',
									optimize: 'none',
									optimizeCss: 'none',
									paths: 
										{
										},
									modules : 
										[{
											'name' : 'selectioner',
											'include': 
												[
													'extensions/single-select', 
													'extensions/multi-select',
													'extensions/date-select',
													'extensions/combo-select',
													'extensions/auto-complete'
												],
											'create': true
										}],
									fileExclusionRegExp: /^(.git|node_modules)$/,
									wrap: 
										{
											start: '<%= banner.full %>' + '\n;(function(window, document, $){ \n\'use strict\';',
											end: '})(this, document, jQuery);'
										},
									onBuildWrite: 
										function (id, path, contents) 
										{										
											// Remove AMD for use without require.js
											if ((/(define)\s*\([^\{]+\{/).test(contents)) 
											{
												contents = contents.replace(/(define)\s*\([^\{]+\{/, '');
												contents = contents.replace(/\s*\}\s*\);\s*?$/,'');
											}
											else if ((/require\([^\{]*?\{/).test(contents))
											{
												contents = contents.replace(/require[^\{]+\{/, '');
												contents = contents.replace(/\s*\}\s*\);\s*?$/,'');
											}

											return contents;
										}
								}
						}
				},
			stripdefine: 
				{
					build: 
						[
							'build/selectioner.js'
						]
				},
			less: 
				{
					options: 
						{
							paths: ['source/styles']
						},
					src: 
						{
							expand: true,
							cwd: 'source/styles',
							src: '*.less',
							ext: '.css',
							dest: 'build/styles'
						}
				},
			uglify: 
				{
					options: 
						{
							banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
						},
					build: 
						{
							src: 'build/<%= pkg.name.toLowerCase() %>.js',
							dest: 'build/<%= pkg.name.toLowerCase() %>.min.js'
						}
				}
		});
		
	grunt.registerMultiTask(
		'stripdefine', 
		'Strip the define call from built file',
		function() 
		{
			this.filesSrc.forEach(
				function(filepath) 
				{
					// Remove define(...) from the built file.
					grunt.file.write(
						filepath, 
						grunt.file.read(filepath).replace(/define\(.*\);\s*/g, ''));
				});
		});

	// Load the required grunt plugins
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-less');

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'requirejs', 'stripdefine', 'less', 'uglify']);
};