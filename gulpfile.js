
var gulp = require('gulp'),
  concat = require('gulp-concat'),
  jshint = require('gulp-jshint'),
  wrap = require('gulp-wrap');

gulp.task('default', ['dexm']);

gulp.task('dexm', ['jshint'], function() {
  return gulp.src('src/*.js')
    .pipe(concat('dexm.js'))
    .pipe(wrap({ src : 'src/wrap.txt' }))
    .pipe(gulp.dest('dist'));
});


gulp.task('jshint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
