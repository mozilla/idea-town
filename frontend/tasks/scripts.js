const gulp = require("gulp");
const config = require("../config.js");
const path = require("path");
const fs = require("fs");

const gulpif = require("gulp-if");
const gutil = require("gulp-util");
const source = require("vinyl-source-stream");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const runSequence = require("run-sequence");

function shouldLint(opt, task) {
  return config[opt] ? [task] : [];
}

gulp.task("scripts-clean", () => {
});

gulp.task("scripts-watch", () => {
  gulp.watch(config.SRC_PATH + "scripts/**/*.js", ["scripts-misc"]);
});

gulp.task("scripts-misc", () => {
  return gulp.src(config.SRC_PATH + "scripts/**/*")
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(gulpif(!config.IS_DEBUG, uglify()))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(config.DEST_PATH + "static/scripts"));
});

gulp.task("scripts-build", done => runSequence(
  "scripts-clean",
  "scripts-misc",
  done
));
