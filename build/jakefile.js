/* See http://howtonode.org/intro-to-jake for more information on how this works. */
var fileSystem = require('fs');

var settings =
    {
        encoding: 'utf-8',
        eol: process.platform === 'win32' ? '\n\r' : '\n',
        pathDelimiter: process.platform == 'win32' ? '\\' : '/',
        defaultSourcePath: '../source/',
        defaultDestinationPath: '../'
    };

// See http://en.wikipedia.org/wiki/ANSI_escape_code#Colors for how colours work.
var colorReset = '\u001b[0m';
var colors = 
	{
		black: colorReset + '\u000b[30m',
		red: colorReset + '\u001b[31m',
		green: colorReset + '\u001b[32m',
		yellow: colorReset + '\u001b[33m',
		blue: colorReset + '\u001b[34m',
		magenta: colorReset + '\u001b[35m',
		cyan: colorReset + '\u001b[36m',
		lightGrey: colorReset + '\u001b[37m',
		grey: colorReset + '\u001b[30;1m',
		lightRed: colorReset + '\u001b[31;1m',
		lightGreen: colorReset + '\u001b[32;1m',
		lightYellow: colorReset + '\u001b[33;1m',
		lightBlue: colorReset + '\u001b[34;1m',
		lightMagenta: colorReset + '\u001b[35;1m',
		lightCyan: colorReset + '\u001b[36;1m',
		white: colorReset + '\u001b[37;1m',
		reset: colorReset
	};
	
// Obtain the destination paths.
var getDestinationFiles = function()
{
    var destinationPath = settings.defaultDestinationPath;

    var paths = 
        {
            development: destinationPath + 'selectioner.js',
            release: destinationPath + 'selectioner.min.js'
        };
    return paths;
}

// Obtain the source paths.
var getSourceFiles = function ()
{
    var sourcePath = settings.defaultSourcePath;

    var paths =
        [
            sourcePath + 'header.js',
			sourcePath + 'namespaces.js',
			sourcePath + 'Utility/copyCss.js',
			sourcePath + 'Utility/copyData.js',
			sourcePath + 'Base/eventable.js',
			sourcePath + 'Base/popup.js',
			sourcePath + 'Base/display.js',
			sourcePath + 'Base/dialog.js',
			sourcePath + 'display/listBox.js',
			sourcePath + 'display/comboBox.js',
			sourcePath + 'dialog/singleSelect.js',
			sourcePath + 'dialog/multiSelect.js',
            sourcePath + 'extensions/singleSelect.js',
            sourcePath + 'extensions/multiSelect.js',
			sourcePath + 'extensions/comboSelect.js',
            sourcePath + 'footer.js',
        ];
    return paths;
};

// Mash an array of source files into the destination file.
function mash(sources, destination)
{
    var out = sources.map
        (
            function (filePath)
            {
                return fileSystem.readFileSync(filePath, settings.encoding);
            }
        );

    fileSystem.writeFileSync(destination, out.join(settings.eol), settings.encoding);
    log(colors.cyan + 'Built: ' + colors.white + destination);
};

// Minify the souce file, and save it to the destination file.
function minify(source, destination)
{
    var uglyfyJS = require('uglify-js');

    var result = uglyfyJS.minify(source);

    fileSystem.writeFileSync(destination, result.code, settings.encoding);
    log(colors.cyan + 'Built: ' + colors.white + destination);
};

function jsHintify(filePath)
{
	var jsHint = require('jshint').JSHINT;
	
	var javascript = fileSystem.readFileSync(filePath, settings.encoding);
	
	var success = jsHint(javascript);
	
	if (!success)
	{
		var errors = jsHint.errors;
		log(colors.yellow + 'JSHint Errors:\n');
		log(colors.cyan + '  Path: ' + colors.white + filePath + ':');
		for (var i = 0, length = errors.length; i < length; i++)
		{
			var error = errors[i];
			log(colors.yellow + '  - Line ' + colors.lightRed + error.line + colors.yellow + ': ' + colors.lightYellow + error.reason);
		}
	}
}

function log(message)
{
	console.log(message + colors.reset);
}

desc('This is the default task.');
task
    (
        'default',
        [],
        function ()
        {
            var sourceFiles = getSourceFiles();
            var destination = getDestinationFiles();
			
			log('');

			// Mash and minify the files
            mash(sourceFiles, destination.development);
            minify(destination.development, destination.release);
						
			// Output any JSHint warnings we come across.
			jsHintify(destination.development);
        }
    );