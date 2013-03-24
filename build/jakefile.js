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
            sourcePath + 'dialog/dialog.js',
            sourcePath + 'dialog/multiSelectDialog.js',
            sourcePath + 'display/display.js',
            sourcePath + 'extensions/select.js',
            sourcePath + 'extensions/multiSelect.js',
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
    console.log(destination + ' built.');
};

function minify(source, destination)
{
    var uglyfyJS = require('uglify-js');

    var result = uglyfyJS.minify(source);

    fileSystem.writeFileSync(destination, result.code, settings.encoding);
    console.log(destination + ' built.');
};

desc('This is the default task.');
task
    (
        'default',
        [],
        function ()
        {
            var sourceFiles = getSourceFiles();
            var destination = getDestinationFiles();

            mash(sourceFiles, destination.development);
            minify(destination.development, destination.release);
        }
    );