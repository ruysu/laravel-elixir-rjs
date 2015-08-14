# Laravel Elixir requirejs optimization

Optimize your main requirejs file with Laravel Elixir.

## Installation

First you need to install this package.

```sh
npm install --save-dev laravel-elixir-rjs
```

Then require this package into your `gulpfile.js`.

```js
var Elixir = require('laravel-elixir');
require('laravel-elixir-rjs');
```

Then call the `rjs` method from your mix.

The `rjs` method can take up to four arguments:

  1. `main` (optional): The main file to optimize (defaults to `main.js`).
  3. `baseDir` (optional): The folder in which your js files are stored (defaults to `resources/assets/js`).
  2. `outputPath` (optional): The output folder (defaults to `public/js`).
  4. `options` (optional):  Options object passed to the `r.js` command.

This task defines a watcher for the path defined in `options.watchPath`.

Sample code:

```js
Elixir(function(mix) {
    mix.rjs('main.js', 'resources/assets/js', 'public/js', {
        include: ['underscore', 'jquery', 'moment', 'requirejs'],
        insertRequire: ['main'],
        watchPath: ['app/**/*.js', 'main.js']
    });
});
```