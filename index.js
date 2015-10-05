var gulp = require('gulp'),
    gutil = require('gulp-util'),
    Elixir = require('laravel-elixir'),
    _ = require('lodash'),
    requirejs = require('requirejs'),
    through = require('through2'),
    config = Elixir.config;

/**
 * Optimize gulp task
 * @param  {object} options The options object passed to rjs command
 */
var optimize = function(options) {
    var stream = through.obj(function(file, enc, cb) {
        var out = options.out;

        // Convert to the main file to a vinyl file
        options.out = function(text) {
            cb(null, new gutil.File({
                path: out,
                contents: new Buffer(text)
            }));
        };

        // Optimize the main file
        requirejs.optimize(options, null, function(err) {
            stream.emit('error', new gutil.PluginError('gulp-rjs', err.message));
        });
    });

    return stream;
}

/**
 * Register the rjs taks on laravel elixir
 * @param  {string|object} main      The main file to optimize or and options object
 * @param  {string|object} baseDir   The base path on wich to look for scripts, or an options object
 * @param  {string|object} outputDir The output path on wich to save the optimized file, or an options object
 * @param  {object}        options   The options object passed to rjs command
 */
Elixir.extend('rjs', function(main, baseDir, outputDir, options) {
    // Options were provided instead of a main file
    if (typeof main == 'object') {
        options = main;
        main = 'main.js';
    }

    // Options were provided on the baseDir parameter
    if (typeof baseDir == 'object') {
        options = baseDir;
        baseDir = null;
    }

    // Options were provided on the outputDir parameter
    if (typeof outputDir == 'object') {
        options = outputDir;
        outputDir = null;
    }

    // If no main file was provided, default to main.js
    main = main || 'main.js';

    // Parse the source and output paths
    var paths = new Elixir.GulpPaths()
        .src(main, baseDir || config.get('assets.js.folder'))
        .output(outputDir || config.get('public.js.outputFolder'))

    if (typeof options != 'object') {
        options = {};
    }

    var watch = options.watchPath || false;

    // if a watch path was provided, delete it from the options
    if (watch) {
        delete options.watchPath;
    }

    var task = new Elixir.Task('rjs', function() {
        // Add some defaults in case they were not provided
        var optimizeOptions = _.merge({   
            // The main config file
            mainConfigFile: paths.src.path,
            // The base path on wich requirejs should look for scripts, or an options object, defaults to baseDir
            baseUrl: paths.src.baseDir,
            // The output file, defaults to the main requirejs file's filename
            out: paths.src.name,
            // The name of the module generated with the first define on the main js
            name: paths.src.name.replace(new RegExp(paths.src.extension + '$'), '')
        }, options);

        return gulp.src(paths.src.path)
            .pipe(optimize(optimizeOptions))
            .pipe(gulp.dest(paths.output.path))
            .pipe(new Elixir.Notification().message('Optimized!'));
    });

    // if a watch path was provided
    if (watch) {
        // If only one path was provided, convert to array
        if (typeof watch != 'object') watch = [watch];

        // Concatenate the baseDir on each watch path
        watch = watch.map(function(path){
            return paths.src.baseDir + '/' + path;
        });

        // register the watcher
        task.watch(watch);
    }
});
