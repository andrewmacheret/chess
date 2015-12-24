var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var notify = require('gulp-notify');

var staticDir = './static';
var sourceDir = './src';
var buildDir = './build';
var mainJs = 'index.js';

function buildScript(file, watch) {
  var props = watchify.args;
  props.entries = [sourceDir + '/' + file];
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
      .pipe(source(file))
      .pipe(gulp.dest(buildDir + '/'));
    
    var end = new Date().getTime();
    var time = end - start;
    gutil.log('Finished', "'" + gutil.colors.cyan('rebundle') + "'", 'after', gutil.colors.magenta(time + ' ms'));
    
    return b;
  }

  bundler.on('update', rebundle);
  return rebundle();
}

gulp.task('copy-folder', function() {  
  gulp.src(staticDir + '/**/*')
    .pipe(gulp.dest(buildDir + '/'));
});


gulp.task('watch', function() {
  gulp.watch(staticDir + '/**/*', ['copy-folder']);
  return buildScript(mainJs, true);
});

gulp.task('build', ['copy-folder'], function() {
  return buildScript(mainJs, false);
});


gulp.task('default', ['build', 'watch']);

gulp.task('test', ['build'], function() {
  gutil.log(gutil.colors.yellow('TODO:'), 'Add more extensive tests than just a build.');
  gutil.log(gutil.colors.green('TESTS PASS!'))
});

