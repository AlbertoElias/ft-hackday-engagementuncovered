'use strict';
var gulp = require('gulp');
var obt = require('origami-build-tools');

gulp.task('build', function() {
	obt.build(gulp, {
		buildJs: 'bundle.js',
		buildCss: 'bundle.css',
		buildFolder: 'public'
	});
});

gulp.task('verify', function() {
	obt.verify(gulp);
});

gulp.task('watch', ['build'], function() {
	gulp.watch(['./src/**/*', './index.html', './main.js', 'main.scss'], ['build']);
});

gulp.task('default', ['verify', 'build', 'watch']);