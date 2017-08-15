const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('default', function() {
    gulp.src('src/*')
    .pipe(gulp.dest('dist-chrome'))
    .pipe(zip('bvbbpp.xpi'))
    .pipe(gulp.dest('dist-firefox'))
});