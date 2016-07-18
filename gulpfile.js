var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var sassdoc = require('sassdoc');
var pkg = require('./package.json');

var banner = ['/*!\n',
    ' * GongKia - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');


var input = './assets/scss/**/*.scss';
var output = './assets/css/';

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

var sassdocOptions = {
  dest: './assets/sassdoc'
};

gulp.task('scss', function() {
  return gulp
    .src(input)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write('./assets/css/maps'))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(output));
});

gulp.task('sassdoc', function() {
  return gulp
    .src(input)
    .pipe(sassdoc(sassdocOptions))
    .resume();
});

gulp.task('watch', function() {
  return gulp
    .watch(input, ['scss'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running task...');
    });
});

// Default
gulp.task('default', ['scss', 'watch']);

// Production
gulp.task('production', ['sassdoc'], function() {
  return gulp
    .src(input)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(output));
});