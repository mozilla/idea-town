/* eslint-disable import/no-extraneous-dependencies*/
require('babel-polyfill');

const gulp = require('gulp');
const config = require('./frontend/config.js');

const del = require('del');
const eslint = require('gulp-eslint');
const runSequence = require('run-sequence');

require('es6-promise').polyfill();
require('isomorphic-fetch');

require('./frontend/tasks/content');
require('./frontend/tasks/scripts');
require('./frontend/tasks/styles');
require('./frontend/tasks/images');
require('./frontend/tasks/assets');
require('./frontend/tasks/pages');
require('./frontend/tasks/server');
require('./frontend/tasks/dist');

require('./addon/tasks/locales');

gulp.task('clean', () => del([
  config.DEST_PATH,
  config.DIST_PATH
]));

gulp.task('distclean', () => del([
  config.DEST_PATH,
  config.DIST_PATH,
  './node_modules',
  './addon/node_modules'
]));

gulp.task('build', done => runSequence(
  'content-build',
  'addon-copy-locales',
  'scripts-build',
  'styles-build',
  'images-build',
  'assets-build',
  'pages-build',
  done
));

gulp.task('watch', [
  'self-watch',
  'content-watch',
  'addon-watch-locales',
  'scripts-watch',
  'styles-watch',
  'images-watch',
  'assets-watch',
  'pages-watch'
]);

gulp.task('default', done => runSequence(
  'self-lint',
  'clean',
  'build',
  'watch',
  'server',
  done
));

// Exit if the gulpfile changes so we can self-reload with a wrapper script.
gulp.task('self-watch', () => gulp.watch([
  './gulpfile.babel.js',
  './frontend/config.js',
  './debug-config.json',
  './frontend/tasks/*.js'
], () => process.exit()));

gulp.task('self-lint', () => gulp.src('gulpfile.babel.js')
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failOnError()));
