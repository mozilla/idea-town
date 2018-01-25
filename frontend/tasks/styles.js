const gulp = require("gulp");
const config = require("../config.js");

const autoprefixer = require("gulp-autoprefixer");
const del = require("del");
const gulpif = require("gulp-if");
const minifycss = require("gulp-cssnano");
const normalize = require("node-normalize-scss");
const sass = require("gulp-sass");
const sassImporter = require("sass-module-importer");
const sourcemaps = require("gulp-sourcemaps");

gulp.task("styles-clean", () => del([
  config.DEST_PATH + "styles"
]));

gulp.task("styles-build", ["styles-clean"], () => {
  return gulp.src(config.SRC_PATH + "styles/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass({ includePaths: [normalize.includePaths], importer: sassImporter() })
    .on("error", sass.logError))
    .pipe(autoprefixer("last 2 versions"))
      // don't minify in development...
      // and set cssNano.reduceIdents to false
      // because we need to maintain our keyframe naming
      // across gulp and webpack
      // TODO: #3111
      .pipe(gulpif(!config.IS_DEBUG, minifycss({ reduceIdents: false })))
      .pipe(gulpif(config.IS_DEBUG, sourcemaps.write(".")))
    .pipe(gulp.dest(config.DEST_PATH + "static/styles"));
});

gulp.task("styles-watch", () => {
  gulp.watch(config.SRC_PATH + "styles/**/*", ["styles-build"]);
});
