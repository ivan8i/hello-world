// #region Constant ---------------------------------------
const { src, dest, watch, series, parallel } = require('gulp'),
  sass          = require('gulp-dart-sass'),
  header        = require('gulp-header'),
  sourcemaps    = require('gulp-sourcemaps'),
  autoprefixer  = require('gulp-autoprefixer'),
  concat        = require('gulp-concat'),
  uglify        = require('gulp-uglify'),
  cleancss      = require('gulp-clean-css'),
  rename        = require('gulp-rename'),
  filter        = require('gulp-filter'),
  gulpif        = require('gulp-if'),
  plumber       = require('gulp-plumber'),
  clean         = require('gulp-clean'),
  babel         = require('gulp-babel'),
  bs            = require('browser-sync').create(),
  color         = require('ansi-colors'),
  pkg           = require('./package.json'),
  config        = require('./config.json');
const { format } = require('date-fns');
// #endregion ---------------------------------------------

// #region Config -----------------------------------------
const environment = process.env.NODE_ENV !== 'production' ? true : false
console.log('env', environment ? 'development' : 'production')
const banner = [`/*!
  * ${pkg.title} v${pkg.version} (${pkg.homepage})
  * Copyright 2013-${(new Date()).getFullYear()} ${pkg.author} / ${pkg.company}
  * Licensed under ${pkg.license} (${pkg.homepage}/blob/master/LICENSE)
  */
`].join('');
// #endregion ---------------------------------------------

// #region Sources ----------------------------------------
const scss = () =>
  src(gulpif(environment, config.scss.input, config.scss.input.concat(config.scss.exclude)))
    .pipe(filter(file => !/\/\_/.test(file.path) || !/^_/.test(file.relative)))
    .pipe(header(banner, { pkg }))
    .pipe(gulpif(environment, sourcemaps.init()))
    .pipe(sass(config.scss.options).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulpif(environment, sourcemaps.write('./')))
    .pipe(dest(config.scss.output));

const script = () =>
  src(gulpif(environment, config.js.input, config.js.input.concat(config.js.exclude)))
    .pipe(gulpif(environment, sourcemaps.init()))
    .pipe(plumber())
    .pipe(concat('common.js'))
    .pipe(babel(config.babel))
    .pipe(header(banner, { pkg }))
    .pipe(gulpif(environment, sourcemaps.write('./')))
    .pipe(dest(config.js.output));
// #endregion ---------------------------------------------

// #region Minify -----------------------------------------
const minifyCSS = () => 
  src(config.scss.input)
    .pipe(sass(config.scss.options).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleancss())
    .pipe(header(banner, { pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(config.scss.output))

const minifyJS = () => 
  src(config.js.input)
    .pipe(plumber())
    .pipe(concat('common.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(babel(config.babel))
    .pipe(uglify())
    .pipe(header(banner, { pkg }))
    .pipe(dest(config.js.output))

// #endregion ---------------------------------------------

// #region Vendor -----------------------------------------
const vendorCSS = () =>
  src(config.vendor.input.css)
    .pipe(concat('vendor.css'))
    .pipe(header(banner, { pkg }))
    .pipe(dest(config.vendor.output))

const vendorJS = () =>
  src(config.vendor.input.js)
    .pipe(concat('vendor.js'))
    .pipe(header(banner, { pkg }))
    .pipe(dest(config.vendor.output))

const vendorCSSMinify = () =>
  src(config.vendor.input.css)
    .pipe(concat('vendor.css'))
    .pipe(cleancss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { pkg }))
    .pipe(dest(config.vendor.output))

const vendorJSMinify = () =>
  src(config.vendor.input.js)
    .pipe(concat('vendor.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(header(banner, { pkg }))
    .pipe(dest(config.vendor.output))

const vendorFont = () =>
  src(config.fonts.input)
    .pipe(dest(config.fonts.output))
// #endregion ---------------------------------------------

// #region Clean ------------------------------------------
const cleanIt = cb => 
  src(config.clean.dev, { read: false })
    .pipe(clean())
const rebuildIt = cb =>
  src(config.clean.rebuild, { read: false })
    .pipe(clean())
// #endregion ---------------------------------------------

// #region Browser Sync -----------------------------------
const browserSync = done => {
  bs.init({
    server: {
      baseDir: './dist'
    },
    notify: false,
    open: true
  })
  done()
}
const browserSyncReload = done => {
  bs.reload()
  done()
}
// #endregion ---------------------------------------------

// #region Watch ------------------------------------------
const setWatch = cb => {
  global.isWatching = true
}
const Watch = cb => {
  let dt = (path, stats) =>
    console.log(
      `[${color.gray(format(stats.mtime, 'HH:mm:ss'))}]`,
      `File '${color.cyan(path)}' was changed, running tasks...`
    )
  watch(config.html.input, browserSyncReload)
    .on('change', (path, stats) => dt(path, stats))
  watch(config.scss.input, series(scss, browserSyncReload))
    .on('change', (path, stats) => dt(path, stats))
  watch(config.js.input, series(script, browserSyncReload))
    .on('change', (path, stats) => dt(path, stats))
}
// #endregion ---------------------------------------------

// #region Define complex tasks ---------------------------
const source = parallel(scss, script)
const vendor = parallel(vendorCSS, vendorJS, vendorFont)
const minify = parallel(minifyCSS, minifyJS, vendorCSSMinify, vendorJSMinify)
const init = series(source, vendor)
const rebuild = series(rebuildIt, init)
const prod = series(cleanIt, vendorFont, minify)
// #endregion ---------------------------------------------

// #region Export Tasks -----------------------------------
exports.init = init
exports.rebuild = rebuild
exports.default = series(browserSync, Watch)
exports.prod = prod
// #endregion ---------------------------------------------