var gulp = require('gulp'),
    del = require('del'),
    gulpif = require('gulp-if'),
    htmlhint = require('gulp-htmlhint'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    gutil = require('gulp-util'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    glob = require('glob').sync,
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    transform = require('vinyl-transform'),
    fs = require('fs'),
    properties = require('properties');

var DEV_MODE = true;

// Views
gulp.task('views', function(){
  return gulp.src('web/views/**/*.html')
    .pipe(htmlhint())
    .pipe(htmlhint.failReporter());
});

// Stylesheets
gulp.task('stylesheets', function(){
  return gulp.src(['web/stylesheets/**/*.less'])
    .pipe(less({
      paths: ['./web']
    }))
    .on('error', gutil.log)
    .pipe(autoprefixer({browsers: ['> 1% in CN'], cascade: false}))
    .pipe(gulpif(!DEV_MODE, minifycss()))
    .pipe(gulp.dest('web/compiled/stylesheets'));
});

// Scripts
gulp.task('scripts', ['constants', 'tp'], function(){
  gulp.start('compileScripts');
});

// Config constants
gulp.task('constants', function(){
  return properties.parse('config/config.properties', {
    path: true,
    sections: true
  }, function(error, obj) {
    DEV_MODE = obj.DEV_MODE;
    var content = '//This file is dynamically generated by config.properties. Please do not change it. \n';
    for (var k in obj.web) {
      content = content + 'exports.' + k + ' = "' + obj.web[k] + '";\n';
    }
    fs.writeFileSync('web/components/common/constants.js', content);
  });
});

// Third party libraries. Need to re-compile to remove source mapping
gulp.task('tp', function(){
  return gulp.src(['web/bower_components/angular/angular.min.js', 'web/components/tp/**/*.js'])
    .pipe(uglify({
      mangle: false,
      compress: false
    }))
    .pipe(gulp.dest('web/compiled/scripts/tp'));
});

gulp.task('compileScripts', ['jshint'], function(){
  gulp.start('mobile_scripts', 'pc_scripts');
});

gulp.task('jshint', function() {
  return gulp.src(['./web/components/**/*.js', '!./web/components/tp/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

// Mobile Scripts
gulp.task('mobile_scripts', function(){
  return browserify({
    entries: glob('./web/components/mobile/controller/**/*.js'),
    paths: ['./web/components']
  })
    .bundle()
    .pipe(source('csboilerplate.js'))
    .pipe(buffer())
    .pipe(gulpif(!DEV_MODE, uglify({
      mangle: false
    })))
    .pipe(gulp.dest('./web/compiled/scripts/mobile'));
});

// PC Scripts
gulp.task('pc_scripts', function(){
  return browserify({
    entries: glob('./web/components/pc/controller/**/*.js'),
    paths: ['./web/components']
  })
    .bundle()
    .pipe(source('csboilerplate.js'))
    .pipe(buffer())
    .pipe(gulpif(!DEV_MODE, uglify({
      mangle: true
    })))
    .pipe(gulp.dest('./web/compiled/scripts/pc'));
});

// Clean
gulp.task('clean', function(cb) {
  del(['web/compiled/stylesheets', 'web/compiled/scripts', 'web/components/constants.js'], cb);
});

// Default task
gulp.task('default', ['clean'], function() {
  gulp.start('views', 'stylesheets', 'scripts');
});

gulp.task('watch', function() {
  gulp.watch('web/stylesheets/**/*.less', ['stylesheets']);
  gulp.watch('web/components/**/*.js', ['scripts']);
});