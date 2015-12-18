angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("guess/date.html","<div class=\'guess--wrapper\'>\n  <label for=\'guess--date\' class=\'text-muted guess--date-label\'>Your Guess</label>\n  <br/>\n  <input class=\'text-center guess--date\' id=\'guess--date\' stype=\'text\' placeholder=\'When will Angular 2.0 be released?\' readOnly />\n</div>\n");
$templateCache.put("pages/about.html","<div class=\'row\'>\n  <div class=\'col-lg-offset-2 col-lg-7\'>\n    <p>ng-guess was created by <a href=\'http://adamfortuna.com\'>Adam Fortuna</a> as a way to learn a little more about <a href=\'firebase.com\'>Firebase</a> and <a href=\'http://d3js.org/\'>D3.js</a>.</p>\n\n    <p>The code for ng-guess is available on GitHub at <a href=\'https://github.com/adamfortuna/ng-guess\'>adamfortuna/ng-guess</a>.</p>\n\n    <p>If you\'d like to get in touch, my email is <a href=\'mailto:adam@fortuna.name\'>adam@fortuna.name</a>.\n  </div>\n</div>\n\n<footer class=\'row footer\'>\n  <div class=\'col-lg-7 col-lg-offset-2 footer--list\'>\n    <ul class=\'list-inline pull-right\' ng-show=\'ctrl.auth\'>\n      <li><a class=\'footer--link\' href=\'\' ng-href=\'#/\' ng-click=\'ctrl.logout()\'>Logout</a></li>\n    </ul>\n    <ul class=\'list-inline\'>\n      <li><a class=\'footer--link\' href=\'\' ng-href=\'#/\'>Home</a></li>\n      <li><a class=\'footer--link\' href=\'\' ng-href=\'#/about\'>About</a></li>\n    </ul>\n  </div>\n</footer>\n");
$templateCache.put("pages/index.html","<div class=\'row\'>\n  <div class=\'col-lg-offset-2 col-lg-7\'>\n    <p class=\'text-center\'>Now that <a href=\'https://angular.io/\' target=\'_blank\'>Angular 2 is in beta</a> it\'s only a matter of time before it goes 2.0!</br>Make your guess on when the framework will mature.</p>\n    <br/>\n    <div ng-hide=\'ctrl.auth\'>\n      <div class=\'chart--wrapper\'>\n        <p class=\'chart--teaser  text-center\'>\n          <button class=\'btn btn-lg btn-block btn-social btn-github\' ng-click=\'ctrl.login()\'>\n            <span class=\"fa fa-github\"></span> Sign in with GitHub to make your<br/>guess and see all <b>{{ctrl.guesses.length}}</b> guesses\n          </button>\n        </p>\n        <gs-distribution-chart class=\'blurry\' animate=\'false\' guesses=\'ctrl.guesses\' ng-if=\'ctrl.guesses.length > 0\'></gs-distribution-chart>\n      </div>\n    </div>\n\n    <div ng-if=\'ctrl.auth\'>\n      <div ng-if=\'ctrl.user.updated_at\'>\n        <gs-date user=\'ctrl.user\'></gs-date>\n      </div>\n\n      <div ng-if=\'ctrl.guessMade()\'>\n        <div class=\'guess--overview row\' ng-if=\'ctrl.guesses.length > 0\'>\n          <gs-average class=\'col-md-5 col-md-offset-3\' guesses=\'ctrl.guesses\'></gs-average>\n        </div>\n\n        <gs-distribution-chart guesses=\'ctrl.guesses\' animate=\'true\' guessDate=\'ctrl.user.guessDate\' ng-if=\'ctrl.guesses.length > 0\' ></gs-distribution-chart>\n\n        <gs-distribution-table class=\'gs-distribution-table\' guesses=\'ctrl.guesses\' ng-if=\'ctrl.guesses.length > 0\' ></gs-distribution-table>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\'row learn-angular\' ng-if=\'ctrl.auth\'>\n  <h2 class=\'text-center col-md-11\'>Learn Angular Today</h2>\n  <div class=\'card col-md-4 col-md-offset-1\'>\n    <img class=\"card-img-top\" src=\"/images/angular-badge.png\" alt=\"Shaping Up With Angular.js Logo\">\n    <div class=\"card-block\">\n      <h4 class=\"card-title\">Learn Angular!</h4>\n      <p class=\"card-text\">\n        Start learning the current version of Angular.js today with Code School\'s free\n        <a href=\'http://angular.codeschool.com\'>Shaping Up With Angular.js</a> course with <strong>over an hour of video</strong>.\n      </p>\n      <a href=\"http://angular.codeschool.com\" class=\"btn btn-primary\">Learn Angular Free Today</a>\n    </div>\n  </div>\n\n  <div class=\'card col-md-4 col-md-offset-1\'>\n    <img class=\"card-img-top\" src=\"/images/angular2.png\" alt=\"Angular 2.0 Logo\">\n    <div class=\"card-block\">\n      <h4 class=\"card-title\">Prepare For Angular 2!</h4>\n      <p class=\"card-text\">\n        Check out the official 5 minute Quickstart to learn the basics of Angular 2.0.\n      </p>\n      <a href=\"https://angular.io/docs/ts/latest/quickstart.html\" class=\"btn btn-primary\">Angular 2 Quickstart</a>\n    </div>\n  </div>\n</div>\n\n<footer class=\'row footer\'>\n  <div class=\'col-lg-7 col-lg-offset-2 footer--list\'>\n    <ul class=\'list-inline pull-right\' ng-show=\'ctrl.auth\'>\n      <li><a class=\'footer--link\' href=\'\' ng-href=\'#/\' ng-click=\'ctrl.logout()\'>Logout</a></li>\n    </ul>\n    <ul class=\'list-inline\'>\n      <li><a class=\'footer--link\' href=\'\' ng-href=\'#/\'>Home</a></li>\n      <li><a class=\'footer--link\' href=\'\' ng-href=\'#/about\'>About</a></li>\n    </ul>\n  </div>\n</footer>\n");
$templateCache.put("reports/average.html","<div\n  <small class=\'text-muted\'>\n    Our Best Guess\n  </small>\n  <div class=\'card card-block\'>\n    <h3 class=\'text-center\'>{{ctrl.calculate() | date:\'MMMM d, yyyy\' }}</h3>\n  </div>\n</div>\n");
$templateCache.put("reports/distribution-table.html","<div class=\'distribution--table\'>\n  <h2 class=\'text-center\'>Guesses By Month</h2>\n\n  <table class=\"table table-striped table-bordered\">\n    <thead>\n      <th>Month</th>\n      <th>Count</th>\n    </thead>\n    <tbody>\n      <tr ng-repeat=\'date in ctrl.dates\'>\n        <td>{{date.key}}</td>\n        <td>{{date.values.length}}</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n");}]);