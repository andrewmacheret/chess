var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
var del = require('del'); // rm -rf

var srcDir = 'src';
var htmlDir = '.';
var jsDir = 'js';
var cssDir = 'css';
var imagesDir = 'images';
var buildDir = './build';
var mainJs = 'index.js';
var bundleJs = 'bundle.js';
var minExt = '.min.';
var propertiesFile = 'app.properties';

function buildScript(options) {
  var watch = options.watch;
  var compress = options.compress;

  var props = watchify.args;
  props.entries = [srcDir + '/' + jsDir + '/' + mainJs];
  props.debug = true;
  
  var bundler = browserify(props);
  if (watch) {
    bundler = watchify(bundler);
  }
  bundler.transform(reactify);
  
  function rebundle() {
    gutil.log('Starting', "'" + gutil.colors.cyan('rebundle') + "'...");
    
    var start = new Date().getTime();
    
    var b = bundler.bundle()
      .on('error', notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
      }))
      .pipe(source(mainJs))
      .pipe(rename(bundleJs))
      .pipe(gulp.dest(buildDir + '/' + jsDir));
    
    if (compress) {
      b = b.pipe(streamify(uglify()))
        .pipe(rename({extname: minExt + 'js'}))
        .pipe(gulp.dest(buildDir + '/' + jsDir));
    }

    var end = new Date().getTime();
    var time = end - start;
    gutil.log('Finished', "'" + gutil.colors.cyan('rebundle') + "'", 'after', gutil.colors.magenta(time + ' ms'));
    
    return b;
  }

  bundler.on('update', rebundle);
  return rebundle();
}

gulp.task('copy-css', function() {
  return gulp.src(srcDir + '/' + cssDir + '/*.css')
    .pipe(gulp.dest(buildDir + '/' + cssDir));
});

gulp.task('copy-css-compressed', ['copy-css'], function() {
  return gulp.src(srcDir + '/' + cssDir + '/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename({extname: minExt + 'css'}))
    .pipe(gulp.dest(buildDir + '/' + cssDir));
});

gulp.task('copy-html', function() {
  return gulp.src(srcDir + '/' + htmlDir + '/*.html')
    .pipe(gulp.dest(buildDir + '/' + htmlDir));
});

gulp.task('copy-images', function() {
  return gulp.src(srcDir + '/' + imagesDir + '/*')
    .pipe(gulp.dest(buildDir + '/' + imagesDir));
});

gulp.task('copy-properties', function() {
  return gulp.src(propertiesFile)
    .pipe(gulp.dest(buildDir + '/'));
});

gulp.task('clean', function() {
  return del([ buildDir + '/' ]);
});

gulp.task('watch-dev', ['build-dev'], function() {
  gulp.watch(srcDir + '/' + cssDir + '/*.css', ['copy-css']);
  gulp.watch(srcDir + '/' + htmlDir + '/*.html', ['copy-html']);
  gulp.watch(srcDir + '/' + imagesDir + '/*', ['copy-images']);
  gulp.watch(propertiesFile, ['copy-properties']);
  return buildScript({watch: true, compress: false});
});

gulp.task('build-dev', ['copy-css', 'copy-html', 'copy-images', 'copy-properties'], function() {
  return buildScript({watch: false, compress: false});
});

gulp.task('build', ['copy-css-compressed', 'copy-html', 'copy-images', 'copy-properties'], function() {
  return buildScript({watch: false, compress: true});
});

gulp.task('default', ['watch-dev']);

gulp.task('test', ['build'], function() {
  gutil.log(gutil.colors.yellow('TODO:'), 'Add more extensive tests than just a build.');
  gutil.log(gutil.colors.green('TESTS PASS!'))
});


