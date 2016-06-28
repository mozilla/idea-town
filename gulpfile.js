const autoprefixer = require('gulp-autoprefixer');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
// const cache = require('gulp-cache');
const connect = require('gulp-connect');
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
// const imagemin = require('gulp-imagemin');
const minifycss = require('gulp-cssnano');
const normalize = require('node-normalize-scss');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const through = require('through2');
const uglify = require('gulp-uglify');
const tryRequire = require('try-require');
const Remarkable = require('remarkable');
const md = new Remarkable({
  html: true
});

const packageJSON = require('./package.json');
const vendorModules = Object.keys(packageJSON.dependencies);

const IS_DEBUG = (process.env.NODE_ENV === 'development');

const SRC_PATH = './testpilot/frontend/static-src/';
const DEST_PATH = './testpilot/frontend/static/';

const config = tryRequire('./debug-config.json') || {
  'sass-lint': true,
  'js-lint': true
};

function shouldLint(opt, task) {
  return config[opt] ? [task] : [];
}

function lintTask() {
  return gulp.src(['*.js', SRC_PATH + '{app,test}/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
}

gulp.task('lint', lintTask);

// Lint the gulpfile
gulp.task('selfie', function selfieTask() {
  return gulp.src('gulpfile.js')
    .pipe(lintTask());
});

gulp.task('clean', function cleanTask() {
  return del([
    DEST_PATH
  ]);
});

const legalTemplates = require('./legal-copy/legal-templates');

function convertToLegalPage() {
  return through.obj(function legalConvert(file, encoding, callback) {
    file.contents = new Buffer(`${legalTemplates.templateBegin}
                                ${md.render(file.contents.toString())}
                                ${legalTemplates.templateEnd}`);
    file.path = gutil.replaceExtension(file.path, '.html');
    this.push(file);
    callback();
  });
}

gulp.task('legal', function legalTask() {
  return gulp.src('./legal-copy/*.md')
             .pipe(convertToLegalPage())
             .pipe(gulp.dest('./legal-copy/'));
});

gulp.task('app-main', function appMainTask() {
  return commonBrowserify('app.js', browserify({
    entries: [SRC_PATH + 'app/main.js'],
    debug: IS_DEBUG,
    fullPaths: IS_DEBUG,
    transform: [babelify]
  }).external(vendorModules));
});

gulp.task('app-vendor', function appVendorTask() {
  return commonBrowserify('vendor.js', browserify({
    debug: IS_DEBUG
  }).require(vendorModules));
});

function commonBrowserify(sourceName, b) {
  return b
    .bundle()
    .pipe(source(sourceName))
    .pipe(buffer())
    .pipe(gulpif(IS_DEBUG, sourcemaps.init({loadMaps: true})))
     // don't uglify in development. eases build chain debugging
    .pipe(gulpif(!IS_DEBUG, uglify()))
    .on('error', gutil.log)
    .pipe(gulpif(IS_DEBUG, sourcemaps.write('./')))
    .pipe(gulp.dest(DEST_PATH + 'app/'));
}

gulp.task('scripts', shouldLint('js-lint', 'lint'), function extraScriptsTask() {
  return gulp.src(SRC_PATH + 'scripts/**/*')
    .pipe(gulpif(IS_DEBUG, sourcemaps.init({loadMaps: true})))
    .pipe(gulpif(!IS_DEBUG, uglify()))
    .pipe(gulpif(IS_DEBUG, sourcemaps.write('./')))
    .pipe(gulp.dest(DEST_PATH + 'scripts'));
});

gulp.task('vendor', shouldLint('js-lint', 'lint'), function extraVendorTask() {
  return gulp.src(SRC_PATH + 'vendor/**/*')
    .pipe(gulpif(!IS_DEBUG, uglify()))
    .pipe(gulp.dest(DEST_PATH + 'vendor'));
});

gulp.task('styles', shouldLint('sass-lint', 'sass-lint'), function stylesTask() {
  return gulp.src(SRC_PATH + 'styles/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [
        normalize.includePaths
      ]
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
      // don't minify in development
      .pipe(gulpif(!IS_DEBUG, minifycss()))
      .pipe(gulpif(IS_DEBUG, sourcemaps.write('.')))
    .pipe(gulp.dest(DEST_PATH + 'styles'));
});

// the globbing pattern here should be cleaned up
// when node-sass supports inline ignores
// see the note in the _hidpi-mixin for details
gulp.task('sass-lint', function sassLintTask() {
  const files = [
    SRC_PATH + '/styles/**/*.scss',
    '!' + SRC_PATH + '/styles/_hidpi-mixin.scss'
  ];
  return gulp.src(files)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

gulp.task('images', function imagesTask() {
  return gulp.src(SRC_PATH + 'images/**/*')
    // imagemin skips files https://github.com/sindresorhus/gulp-imagemin/issues/183
    // files have been optimized and rechecked into the repo
    // .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(DEST_PATH + 'images'));
});

gulp.task('locales', function localesTask() {
  return gulp.src('./locales/**/*')
    .pipe(gulp.dest(DEST_PATH + 'locales'));
});

gulp.task('addon', function localesTask() {
  return gulp.src(SRC_PATH + 'addon/**/*')
    .pipe(gulp.dest(DEST_PATH + 'addon'));
});

gulp.task('build', function buildTask(done) {
  runSequence(
    'clean',
    'app-vendor',
    'app-main',
    'scripts',
    'vendor',
    'styles',
    'images',
    'locales',
    'addon',
    'legal',
    done
  );
});

gulp.task('watch', ['build'], function watchTask() {
  gulp.watch(SRC_PATH + 'styles/**/*', ['styles']);
  gulp.watch(SRC_PATH + 'images/**/*', ['images']);
  gulp.watch(SRC_PATH + 'app/**/*.js', ['app-main']);
  gulp.watch('./package.json', ['app-vendor']);
  gulp.watch(SRC_PATH + 'scripts/**/*.js', ['scripts']);
  gulp.watch(SRC_PATH + 'vendor/**/*.js', ['vendor']);
  gulp.watch(SRC_PATH + 'addon/**/*', ['addon']);
  gulp.watch(['./legal-copy/*.md', './legal-copy/*.js'], ['legal']);
  gulp.watch('./locales/**/*', ['locales']);
});

// Set up a webserver for the static assets
gulp.task('connect', function connectTask() {
  connect.server({
    root: DEST_PATH,
    livereload: false,
    port: 9988
  });
});

gulp.task('server', ['build', 'connect', 'watch']);

gulp.task('default', ['build', 'watch']);
