// *************************************
//
//   Config
//
// *************************************


// This is the Angular Module name for your templates
var angularModuleName = 'angular-seed';


// -------------------------------------
//   Modules
// -------------------------------------

var gulp          = require('gulp');
var watch         = require('gulp-watch');
var sass          = require('gulp-sass');
var minifycss     = require('gulp-minify-css');
var rename        = require('gulp-rename');
var autoprefixer  = require('gulp-autoprefixer');
var uglify        = require('gulp-uglify');
var concat        = require('gulp-concat');
var templateCache = require('gulp-angular-templatecache');
var eslint        = require('gulp-eslint');

// -------------------------------------
//   Variables
// -------------------------------------

var options = {
  css: {
    file: 'public/stylesheets/application.css',
    destination: 'public/stylesheets'
  },
  sass: {
    files: ['client/stylesheets/*.sass', 'client/stylesheets/**/*.sass'],
    destination: 'public/stylesheets'
  },
  vendorJs: {
    files: ['client/components/lodash/lodash.js',
            'client/components/d3/d3.js',
            'client/components/angular/angular.js',
            'client/components/firebase/firebase.js',
            'client/components/angularfire/dist/angularfire.js',
            'client/components/angular-route/angular-route.js'],
    destFile: 'vendor.js',
    destDir:  'public/javascripts'
  },
  js: {
    files: ['client/javascripts/config.js',
            'client/javascripts/application.js',
            'client/javascripts/**/*.js'],
    destFile: 'application.js',
    destDir:  'public/javascripts'
  },
  templates: {
    files: 'client/javascripts/**/*.html',
    destFile: 'templates.js',
    destDir: 'public/javascripts',
    options: {
      module: 'templates',
      standalone: true
    }
  },
  eslint: {
    format: 'checkstyle',
    config: {
      globals: {
        'angular': true,
        '_': true,
        'window': true,
        '$': true,
        'Firebase': true
      },
      rules: {
        quotes: ['single']
      },
      envs: [
        'browser'
      ],
      quotes: 'single'
    }
  }
};

// -------------------------------------
//   Task: Default
// -------------------------------------

gulp.task('default', function() {
  watch(options.sass.files, function(files) {
    gulp.start('sass');
    gulp.start('minify-css');
  });

  watch(options.vendorJs.files, function(files) {
    gulp.start('javascript:vendor');
  });
  watch(options.js.files, function(files) {
    gulp.start('javascript:application');
  });
  watch(options.templates.files, function(files) {
    gulp.start('javascript:templates');
  });

  watch(options.js.files, function(files) {
    gulp.start('lint');
  });
});

// -------------------------------------
//   Task: CSS Minify
// -------------------------------------

gulp.task('minify-css', function () {
  gulp.src(options.css.file)
    .pipe(minifycss({ advanced: false }))
    .on('error', function(error) { console.log(error.message); })
    .pipe(rename({ suffix: '.min' }))
    .on('error', function(error) { console.log(error.message); })
    .pipe(gulp.dest(options.css.destination));
});

// -------------------------------------
//   Task: Sass
// -------------------------------------

gulp.task('sass', function () {
  gulp.src(options.sass.files)
      .pipe(sass({ indentedSyntax: true }))
      .on('error', function(error) { console.log(error.message); })
      .pipe(autoprefixer({
        browsers: [ 'last 2 versions', 'Explorer >= 9' ],
        cascade: false
      }))
      .pipe(gulp.dest(options.sass.destination));
});

// -------------------------------------
//   Task: JavaScript
// -------------------------------------

gulp.task('javascript:vendor', function() {
  gulp.src(options.vendorJs.files)
    .pipe(uglify({ mangle: false }))
    .pipe(concat(options.vendorJs.destFile))
    .pipe(gulp.dest(options.vendorJs.destDir));
});

gulp.task('javascript:application', function() {
  gulp.src(options.js.files)
    // .pipe(uglify({ mangle: false }))
    .pipe(concat(options.js.destFile))
    .pipe(gulp.dest(options.js.destDir));
});

gulp.task('javascript:templates', function () {
  gulp.src(options.templates.files)
      .pipe(templateCache(options.templates.destFile, options.templates.options))
      .pipe(concat(options.templates.destFile))
      .pipe(gulp.dest(options.templates.destDir));
});

gulp.task('lint', function () {
    return gulp.src(options.js.files)
        .pipe(eslint(options.eslint.config))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});
