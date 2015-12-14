(function() {
'use strict';

angular.module('Guess.config', [])
   .constant('version', '0.1')

   // end this with a trailing slash
   .constant('FIREBASE_URL', 'https://ng-guess.firebaseio.com/')

   .config(function($logProvider) {
      // uncomment to enable dev logging in the app
      $logProvider.debugEnabled(true);
   });

}());

window.appName = 'Guess';
angular.module(window.appName, ['firebase', 'templates', 'ngRoute', 'Guess.config']);

(function() {
'use strict';

function routes($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'pages/index.html',
      controller: 'IndexController',
      controllerAs: 'ctrl',
      resolve: { // Start the page as logged in, in case there's a refresh
        'currentUser': ['AuthService', function(AuthService) {
          return AuthService.prepareAuthentication();
        }]
      }
    })

    .when('/about', {
      templateUrl: 'pages/about.html'
    })

    .otherwise({redirectTo: '/'});
}

angular.module(window.appName).config(routes);

}());

/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function IndexController(_, AuthService, UserFactory, currentUser, FIREBASE_URL) {
  var self = this;
  self.login = AuthService.login;
  self.logout = AuthService.logout;
  self.auth = currentUser;
  self.user = AuthService.user.current;
  self.guesses = [];

  AuthService.$onAuth(function(auth) {
    self.auth = auth;
    self.user = AuthService.user.current;
  });

  self.ref = new Firebase(FIREBASE_URL + 'users');

  self.ref.on('value', function(snapshot) {
    var guesses = [];
    snapshot.forEach(function(user) {
      guesses.push(user.val().guessDate);
    });

    self.guesses = _.compact(guesses);
  });

  self.guessMade = function() {
    if(self.user) {
      var guessMade = !_.isUndefined(self.user.guessDate) && self.user.guessDate;
      return guessMade;
    } else {
      return false;
    }
  };

  self.addRandomGuesses = function(guesses) {
    for(var i = 0; i < guesses; i++) {
      var future = new Date(),
          uid = "example-" + parseInt(Math.random() * 10000000000),
          daysFromNow = (self.normal() + 1) * 150,
          example = {
            id: uid,
            displayName: "Example " + uid,
            username: "example-" + uid,
            profileImageURL: "http://example.org/" + uid,
            guessDate: future.setDate(future.getDate() + daysFromNow)
          };
      self.ref.child(uid).set(example);
    }
  };

  // Generate a number between 0 and 1 in the range
  self.normal = function(){
    var nsamples = 6,
        sigma = 1,
        mu = 0;

    var runTotal = 0;
    for(var i = 0; i < nsamples; i++) {
       runTotal += Math.random();
    }

    return sigma * (runTotal - nsamples / 2) / (nsamples / 2) + mu;
  };
}

IndexController.$inject = ['_', 'AuthService', 'UserFactory', 'currentUser', 'FIREBASE_URL'];

angular.module(window.appName)
.controller('IndexController', IndexController);

}());

/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

// ng-model='ctrl.user.guessDate' ng-change='ctrl.guessChanged()'
(function() {
'use strict';

function GuessController(AuthService) {
  this.guessChanged = function(e) {
    var date;
    e.preventDefault();
    if($(this).val()) {
      date = new Date($(this).val()).getTime();
    } else {
      date = null;
    }

    AuthService.user.ref.child('guessDate').set(date);
  };
}

function DateDirective() {
  return {
    replace: true,
    restrict: 'E',
    scope: { user: '=' },
    templateUrl: 'guess/date.html',
    controller: GuessController,
    controllerAs: 'ctrl',
    bindToController: true,
    link: function(scope, el, attrs, ctrl) {
      console.log('pickadate');
      var input = $(el[0]).find('input');
      input.pickadate({
        hiddenName: true,
        min: new Date(),
        format: 'mmmm d, yyyy'
      });

      input.on('change', ctrl.guessChanged);
    }
  };
}

angular.module(window.appName)
.directive('gsDate', DateDirective);


}());

/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function AverageController(d3) {
  this.calculate = function() {
    var avg = d3.mean(this.guesses);
    return new Date(avg);
  };
}


function AverageDirective() {
  return {
    replace: true,
    restrict: 'E',
    scope: { guesses: '=' },
    templateUrl: 'reports/average.html',
    controller: AverageController,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

angular.module(window.appName)
.directive('gsAverage', AverageDirective);


}());

/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function DistributionChartController() {
  this.generateDates = function() {
    var dates = [];
    for (var i = 0; i < 1000; i++) {
      var daysFromNow = self.normal() * 200,
        future = new Date();
      future.setDate(future.getDate() + 200 + daysFromNow);
      dates.push(future);
    }
    return dates.sort(this.sortByDateAscending);
  };

  this.normal = function() {
    var nsamples = 6, sigma = 1, mu = 0;

    var runTotal = 0;
    for (var i = 0; i < nsamples; i++) {
      runTotal += Math.random();
    }

    var normal = sigma * (runTotal - nsamples / 2) / (nsamples / 2) + mu;
    return normal;
  };

  this.getSundayFromWeek = function(week) {
    var tokens = week.split('-'),
      year = tokens[0],
      weekNum = tokens[1];

    var sunday = new Date(year, 0, (1 + (weekNum - 1) * 7));
    while (sunday.getDay() !== 0) {
      sunday.setDate(sunday.getDate() - 1);
    }
    return sunday;
  };

  // Dates will be cast to numbers automagically
  this.sortByDateAscending = function(a, b) {
    return a - b;
  };
}



function DistributionChartDirective(d3) {
  return {
    replace: true,
    restrict: 'E',
    scope: {
      guesses: '=',
      guessDate: '='
    },
    template: '<div><p>guess: {{ctrl.guessDate}}</p></div>',
    controller: DistributionChartController,
    controllerAs: 'ctrl',
    bindToController: true,
    link: function(scope, el, attrs, ctrl) {
      el.empty();

      var dates = ctrl.guesses.sort(ctrl.guesses, ctrl.sortByDateAscending),
        mean = new Date(d3.mean(dates)),
        week = d3.time.format("%Y-%U"),
        fullDay = d3.time.format("%B %e, %Y"),
        data = d3.nest().key(function(d) {
          return week(new Date(d));
        }).entries(dates);

      var margin = {
          top: 10,
          right: 25,
          bottom: 30,
          left: 25
        },
        width = 660 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

      var x = d3.time.scale()
        .range([0, width])
        .domain(d3.extent(data, function(d) {
          return ctrl.getSundayFromWeek(d.key);
        }));

      var y = d3.scale.linear()
        .range([height, 0])
        .domain(d3.extent(data, function(d) {
          return d.values.length;
        }));

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format('%B'));

      var line = d3.svg.line()
        .interpolate('cardinal') // or basis
        .x(function(d) {
          return x(ctrl.getSundayFromWeek(d.key));
        })
        .y(function(d) {
          return y(d.values.length);
        });

      var svg = d3.select(el[0]).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);





      var path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

      // Add an animation
      var totalLength = path.node().getTotalLength();
      path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease("linear")
        .attr("stroke-dashoffset", 0);




      // Median Line
      var medianGroup = svg.append("g")
        .attr('class', 'date--group')
        .attr("transform", "translate(" + x(mean) + "," + 0 + ")");
      // Add the mean line
      medianGroup.append('line')
        .attr('class', 'date--line')
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
      // Add a box
      medianGroup.append("rect")
         .attr('class', 'date--background')
         .attr('x', 0)
         .attr('height', 30)
         .attr('width', 200);
      // Add text for the line
      medianGroup.append("text")
        .attr('class', 'date--text')
        .attr("y", 10)
        .attr('x', 10)
        .attr("dy", ".71em")
        .style("text-anchor", "begin")
        .text('Our Guess: ' + fullDay(mean));


      // Guess Line
      if(ctrl.guessDate) {
        var guessGroup = svg.append("g")
          .attr('class', 'date--group')
          .attr("transform", "translate(" + x(ctrl.guessDate) + "," + 0 + ")");
        // Add the mean line
        guessGroup.append('line')
          .attr('class', 'date--line')
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", height)
          .attr("stroke-width", 2)
          .attr("stroke", "black");
        // Add a box
        guessGroup.append("rect")
           .attr('class', 'date--background')
           .attr('x', -160)
           .attr('height', 30)
           .attr('width', 160);
        // Add text for the line
        guessGroup.append("text")
          .attr('class', 'date--text')
          .attr("y", 10)
          .attr('x', -10)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text('Your Guess: ' + fullDay(ctrl.guessDate));
      }
    }
  };
}

angular.module(window.appName)
       .directive('gsDistributionChart', DistributionChartDirective);
}());

/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function AuthService($rootScope, $firebaseAuth, FIREBASE_URL, UserFactory) {
  var fb = new Firebase(FIREBASE_URL),
      usersRef = new Firebase(FIREBASE_URL + 'users');
  var firebaseAuthObject = $firebaseAuth(fb);
  var service = {
    user: {}
  };

  ////////////

  function setUser(auth) {
    service.user.auth = auth;

    if(auth) {
      service.user.current = UserFactory.new(auth.uid);
      service.user.ref = usersRef.child(auth.uid);
      service.user.ref.child('updated_at').set(Firebase.ServerValue.TIMESTAMP);
      var details = {
        id: auth.github.id,
        displayName: auth.github.displayName,
        username: auth.github.username,
        profileImageURL: auth.github.profileImageURL
      };
      service.user.ref.child('auth').set(details);
    } else {
      service.user.current = null;
      service.user.ref = null;
    }
  }

  function login() {
    return firebaseAuthObject.$authWithOAuthPopup('github');
  }

  function logout() {
    $rootScope.$broadcast('logout');
    firebaseAuthObject.$unauth();
    setUser(null);
  }

  service.setUser = setUser;
  service.firebaseAuthObject = firebaseAuthObject;
  service.prepareAuthentication = firebaseAuthObject.$waitForAuth;
  service.login = login;
  service.logout = logout;
  service.$onAuth = firebaseAuthObject.$onAuth;

  firebaseAuthObject.$onAuth(function(auth) {
    service.user.auth = auth;
    if(auth) {
      setUser(auth);
    }
  });

  return service;
}

AuthService.$inject = ['$rootScope', '$firebaseAuth', 'FIREBASE_URL', 'UserFactory'];

angular.module(window.appName).factory('AuthService', AuthService);

}());

/*eslint no-console: 0*/
/*eslint no-debugger: 0*/


(function() {
'use strict';

function UserFactory($firebaseObject, $firebaseArray, FIREBASE_URL) {
  var users = new Firebase(FIREBASE_URL + 'users'),
      all = $firebaseArray(users);

  var User = $firebaseObject.$extend({

    $$updated: function () {
      // call the super
      var changed = $firebaseObject.prototype.$$updated.apply(this, arguments);

      if(changed) {
        this.guessDate = new Date(this.guessDate || new Date());
      }

      return changed;
    },

    toJSON: function() {
      return angular.extend({}, this, {
        guessDate: this.guessDate ? this.guessDate.getTime() : null
      });
    }

  });

  function newUser(userId) {
    var ref = users.child(userId);
    return new User(ref);
  }

  return {
    new: newUser,
    all: all
  };
}

UserFactory.$inject = ['$firebaseObject', '$firebaseArray', 'FIREBASE_URL'];

angular.module(window.appName).factory('UserFactory', UserFactory);

}());

(function() {
'use strict';

angular.module(window.appName)
.factory('d3', ['$window',
  function($window) {
    return $window.d3;
  }
]);

})();

(function() {
'use strict';

angular.module(window.appName)
.factory('_', ['$window',
  function($window) {
    return $window._;
  }
]);

})();
