var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');

var source = require('vinyl-source-stream');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');

var del = require('del'); // rm -rf

var PATHS = {
  srcDir: './src',
  buildDir: './build',
  htmlDir: '.',
  jsDir: 'js',
  cssDir: 'css',
  imagesDir: 'images',
  mainJs: 'index.js',
  bundleJs: 'bundle.js',
  minExt: '.min.',
  propertiesFile: 'app.properties'
};

// Task to build javascript files
function buildJs(options) {
  // If watch is enabled, will use watchify
  // TODO: rebundle will be called twice when watch is true, not sure why
  var watch = options.watch;
  // If compress is enabled, will additionally create a minified bundle js file
  var compress = options.compress;

  // Set up properties for browserify
  var props = watchify.args;
  props.entries = [PATHS.srcDir + '/' + PATHS.jsDir + '/' + PATHS.mainJs];
  props.debug = true;
  
  // Build browserify with reactify, optionally with watchify
  var bundler = browserify(props);
  if (watch) {
    bundler = watchify(bundler);
  }
  bundler.transform(reactify);
  
  // Build the rebundle function using the bundler we just created
  function rebundle() {
    // Log the start
    gutil.log('Starting', "'" + gutil.colors.cyan('rebundle') + "'...");
    var start = new Date().getTime();
    
    // Build the javascript bundle file
    var b = bundler.bundle()
      .on('error', notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
      }))
      .pipe(source(PATHS.mainJs))
      .pipe(rename(PATHS.bundleJs))
      .pipe(gulp.dest(PATHS.buildDir + '/' + PATHS.jsDir));
    
    // If compress is enabled, also build a minified bundle file
    if (compress) {
      b = b.pipe(streamify(uglify()))
        .pipe(rename({extname: PATHS.minExt + 'js'}))
        .pipe(gulp.dest(PATHS.buildDir + '/' + PATHS.jsDir));
    }

    // Log the end
    var end = new Date().getTime();
    var time = end - start;
    gutil.log('Finished', "'" + gutil.colors.cyan('rebundle') + "'", 'after', gutil.colors.magenta(time + ' ms'));
    
    // Return the bundle object
    return b;
  }

  if (watch) {
    bundler.on('update', rebundle);
  }

  return rebundle();
}

gulp.task('copy-css', function() {
  return gulp.src(PATHS.srcDir + '/' + PATHS.cssDir + '/*.css')
    .pipe(gulp.dest(PATHS.buildDir + '/' + PATHS.cssDir));
});

gulp.task('copy-css-compressed', ['copy-css'], function() {
  return gulp.src(PATHS.srcDir + '/' + PATHS.cssDir + '/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename({extname: PATHS.minExt + 'css'}))
    .pipe(gulp.dest(PATHS.buildDir + '/' + PATHS.cssDir));
});

gulp.task('copy-html', function() {
  return gulp.src(PATHS.srcDir + '/' + PATHS.htmlDir + '/*.html')
    .pipe(gulp.dest(PATHS.buildDir + '/' + PATHS.htmlDir));
});

gulp.task('copy-images', function() {
  return gulp.src(PATHS.srcDir + '/' + PATHS.imagesDir + '/*')
    .pipe(gulp.dest(PATHS.buildDir + '/' + PATHS.imagesDir));
});

gulp.task('copy-properties', function() {
  return gulp.src(PATHS.propertiesFile)
    .pipe(gulp.dest(PATHS.buildDir + '/'));
});

/* main tasks */

gulp.task('clean', function() {
  return del([ PATHS.buildDir + '/' ]);
});

gulp.task('watch-dev', ['build-dev'], function() {
  gulp.watch(PATHS.srcDir + '/' + PATHS.cssDir + '/*.css', ['copy-css']);
  gulp.watch(PATHS.srcDir + '/' + PATHS.htmlDir + '/*.html', ['copy-html']);
  gulp.watch(PATHS.srcDir + '/' + PATHS.imagesDir + '/*', ['copy-images']);
  gulp.watch(PATHS.propertiesFile, ['copy-properties']);
  return buildJs({watch: true, compress: false});
});

gulp.task('watch', ['build-dev'], function() {
  gulp.watch(PATHS.srcDir + '/' + PATHS.cssDir + '/*.css', ['copy-css-compressed']);
  gulp.watch(PATHS.srcDir + '/' + PATHS.htmlDir + '/*.html', ['copy-html']);
  gulp.watch(PATHS.srcDir + '/' + PATHS.imagesDir + '/*', ['copy-images']);
  gulp.watch(PATHS.propertiesFile, ['copy-properties']);
  return buildJs({watch: true, compress: true});
});

gulp.task('build-dev', ['copy-css', 'copy-html', 'copy-images', 'copy-properties'], function() {
  return buildJs({watch: false, compress: false});
});

gulp.task('build', ['copy-css-compressed', 'copy-html', 'copy-images', 'copy-properties'], function() {
  return buildJs({watch: false, compress: true});
});

gulp.task('default', ['watch-dev']);

gulp.task('test', ['build'], function() {
  gutil.log(gutil.colors.yellow('TODO:'), 'Add more extensive tests than just a build.');
  gutil.log(gutil.colors.green('TESTS PASS!'))
});


