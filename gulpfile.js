var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    header        = require('gulp-header'),
    sourcemaps    = require('gulp-sourcemaps'),
    autoprefixer  = require('gulp-autoprefixer'),
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglify'),
    sassdoc       = require('sassdoc'),
    pkg           = require('./package.json');

var banner = ['/*!\n',
    ' * GongKia - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
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
  dest: './sassdoc'
};

gulp.task('scss', function() {
  return gulp
    .src(input)
    .pipe(header(banner, { pkg: pkg }))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(output));
});

gulp.task('script', function() {
  return gulp
    .src('./assets/js/*.js')
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('sassdoc', function() {
  return gulp
    .src(input)
    .pipe(sassdoc(sassdocOptions))
    .resume();
});

//----------------------------------------
// Watch
//----------------------------------------
gulp.task('watch', function() {
  return gulp
    .watch(input, ['scss'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

//----------------------------------------
// Production
//----------------------------------------
gulp.task('prod', function() {
  return gulp
    .src(input)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(output));
});

//----------------------------------------
// Default
//----------------------------------------
gulp.task('default', ['scss']);