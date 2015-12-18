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

// ng-model='ctrl.user.guessDate' ng-change='ctrl.guessChanged()'
(function() {
'use strict';

function GuessController(AuthService) {
  var self = this;
  this.guessChanged = function(e) {
    var date;
    e.preventDefault();
    if($(this).val()) {
      date = new Date($(this).val()).getTime();
    } else {
      date = null;
    }
    self.user.guessDate = date;
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
      var input = $(el[0]).find('input');
      var guessAsDate = new Date(ctrl.user.guessDate);
      input.pickadate({
        hiddenName: true,
        min: new Date()
      });

      if(ctrl.user.guessDate) {
        var picker = input.pickadate('picker');
        picker.set('select', guessAsDate);
      }

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
      var noGuessMade = _.isUndefined(self.user.guessDate) || _.isNull(self.user.guessDate);
      return !noGuessMade;
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
        if(this.guessDate) {
          this.guessDate = new Date(this.guessDate);
        } else {
          this.guessDate = null;
        }
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

/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function AverageController(d3) {
  this.calculate = function() {
    var avg = d3.median(this.guesses);
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

function DistributionChartController(_, d3, $scope) {
  var self = this;
  this.margin = {
      top: 50,
      right: 25,
      bottom: 30,
      left: 25
    };
  this.updateDuration = 500;
  this.width = 660 - this.margin.left - this.margin.right;
  this.height = 400 - this.margin.top - this.margin.bottom;
  this.monthFormat = d3.time.format("%Y-%m");
  this.dayFormat = d3.time.format("%B %e, %Y");
  this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  this.bisectDate = d3.bisector(function(d) { return self.timeForKey(d.key); }).left;

  $scope.$watch('ctrl.guesses', function(data) {
    if(self.isWatching) {
      self.update(data);
    }
  });

  this.sortByDateAscending = function(a, b) {
    return a - b;
  };

  this.timeForKey = function(key) {
    var t = key.split('-');
    return new Date(t[0], t[1], 1);
  };

  this.mousemove = function() {
    try {
      var x0 = self.x.invert(d3.mouse(this)[0]),
          i = self.bisectDate(self.data, x0, 1),
          d0 = self.data[i - 1],
          d1 = self.data[i],
          d = x0 - self.timeForKey(d0.key) > self.timeForKey(d1.key) - x0 ? d1 : d0;
      self.focus.attr("transform", "translate(" + self.x(self.timeForKey(d.key)) + "," + self.y(d.values.length) + ")");
      var month = d.key.split('-')[1],
          monthName = self.monthNames[+month - 1];
      self.focus.select("text").text(monthName + ': ' + d.values.length);
    } catch(e) {
      console.log('Error on mouseover: ' + this);
    }
  };

  this.nestedData = function(data) {
    var dates = data.sort(data, this.sortByDateAscending);
    return d3.nest().key(function(d) {
      return self.monthFormat(new Date(d));
    }).entries(dates);
  };

  this.weightData = function(data) {
    var sortedDates = _.clone(data).sort(),
        length = sortedDates.length;

    sortedDates.splice(Math.floor(length * 0.9), length);
    sortedDates.splice(0, Math.ceil(length * 0.1));

    return this.padData(this.nestedData(sortedDates));
  };

  // Pad the data with one additional month with value of 0 on both sides
  this.padData = function(updatedData) {
    if(updatedData.length === 0) {
      return updatedData;
    }

    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth(),
        key = year + '-' + month;
    if(updatedData[0].key !== key) {
      updatedData.unshift({
        key: key,
        values: []
      });
    }

    var lastItem = updatedData[updatedData.length - 1],
        lastTokens = lastItem.key.split('-'),
        lastYear = lastTokens[0],
        lastMonth = lastTokens[1],
        nextMonth = +lastMonth + 1,
        nextYear = lastYear;

    if(nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }

    updatedData.push({
      key: nextYear + '-' + nextMonth,
      values: []
    });

    return updatedData;
  };

  this.parseData = function(data) {
    var updatedData = this.nestedData(_.clone(data));
    return this.padData(updatedData);
  };

  this.update = function(rawData) {
    if(this.svg) {
      this.data = this.parseData(rawData);
      this.weightedData = this.weightData(rawData);
      this.updateScales(this.data);
      this.updateAxis(this.data);
      this.updateLine(this.data);
      this.updateWeightedLine(this.weightedData);
      this.updateMeanLine(rawData);

      this.rect.on('mousemove', null);
      this.rect.on('mousemove', this.mousemove);
    }
  };

  this.updateScales = function(data) {
    this.x.domain(d3.extent(data, function(d) {
      return self.timeForKey(d.key);
    }));
    this.y.domain(d3.extent(data, function(d) {
      return d.values.length;
    }));
  };

  // Update the X-axis
  this.updateAxis = function(data) {
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient('bottom')
      .tickFormat(d3.time.format('%B'))
      .ticks(data.length);

    this.xAxisElement.call(this.xAxis);
  };

  this.updateLine = function(data) {
    this.path.datum(data)
      .transition()
        .duration(this.updateDuration)
      .attr('d', this.line);
  };

  this.updateWeightedLine = function(data) {
    this.weightedPath.datum(data)
      .transition()
        .duration(this.updateDuration)
      .attr('d', this.line);
  };

  this.updateMeanLine = function(data) {
    var mean = new Date(d3.median(data));
    console.log('mean', mean);

    if(!this.medianGroup) {
      this.medianGroup = this.svg.append("g")
        .attr('class', 'date--group')
        .attr("transform", "translate(" + this.x(mean) + "," + 0 + ")");
    } else {
      this.medianGroup.transition()
            .duration(this.updateDuration * 2)
            .ease("linear")
          .attr("transform", "translate(" + this.x(mean) + "," + 0 + ")");
    }

    if(!this.meanLine) {
      // Add the mean line
      this.meanLine = this.medianGroup.append('line')
        .attr('class', 'date--line')
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", this.height + this.margin.top)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
      // Add a box
      this.medianGroup.append("rect")
         .attr('class', 'date--background')
         .attr('x', 0)
         .attr('height', 30)
         .attr('width', 200);
      // Add text for the line
      this.meanText = this.medianGroup.append("text")
        .attr('class', 'date--text')
        .attr("y", 10)
        .attr('x', 10)
        .attr("dy", ".71em")
        .style("text-anchor", "begin");
    }
    this.meanText.text('Our Guess: ' + this.dayFormat(mean));
  };

  this.startChart = function() {
    var data = this.parseData(this.guesses);
    this.data = data;
    this.weightedData = this.weightData(this.guesses);

    this.x = d3.time.scale().range([0, this.width]);
    this.y = d3.scale.linear().range([this.height, 0]);
    this.updateScales(data);
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient('bottom')
      .tickFormat(d3.time.format('%B'))
      .ticks(data.length);


    // Draw main svg container
    this.svg = d3.select(this.el[0]).append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);
    this.group = this.svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Draw X-axis
    this.xAxisElement = this.group.append('g')
      .attr('class', 'x axis x-axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis);

    // Draw Main Line
    this.line = d3.svg.line()
      .interpolate('cardinal') // or basis
      .x(function(d) {
        return self.x(self.timeForKey(d.key));
      })
      .y(function(d) {
        return self.y(d.values.length);
      });

    this.path = this.group.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', this.line);
    // Add an animation to main line
    if(this.animate) {
      var totalLength = this.path.node().getTotalLength();
      this.path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
    }



    // Draw the weighted line
    this.weightedPath = this.group.append('path')
      .datum(this.weightedData)
      .attr('class', 'line--weighted')
      .attr('d', this.line);



    // Draw Median Line
    this.updateMeanLine(this.guesses);



    // Mouseover
    this.focus = this.group.append('g')
      .attr('class', 'focus')
      .style('display', 'none');
    this.focus.append('circle').attr('r', 4.5);
    this.focus.append('text')
      .attr('x', 9)
      .attr('dy', '.35em');
    this.rect = this.group.append("rect")
          .attr("class", "overlay")
          .attr("width", this.width)
          .attr("height", this.height)
          .on("mouseover", function() { self.focus.style("display", null); })
          .on("mouseout", function() { self.focus.style("display", "none"); })
          .on("mousemove", this.mousemove);



    setTimeout(function() {
      self.isWatching = true;
    }, 3000);
  };
}



function DistributionChartDirective() {
  return {
    replace: true,
    restrict: 'E',
    scope: {
      guesses: '=',
      guessDate: '=',
      animate: '='
    },
    template: '<div></div>',
    controller: DistributionChartController,
    controllerAs: 'ctrl',
    bindToController: true,
    link: function(scope, el, attrs, ctrl) {
      el.empty();
      ctrl.el = el;
      ctrl.startChart();
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

function DistributionTableController(d3, $scope) {
  var self = this;
  this.monthFormat = d3.time.format("%Y - %B");

  $scope.$watch('ctrl.guesses', function(data) {
    self.dates = self.parseData(data);
  });

  this.parseData = function(data) {
    var dates = data.sort(data, this.sortByDateAscending);
    return d3.nest().key(function(d) {
      return self.monthFormat(new Date(d));
    }).entries(dates);
  };

  this.sortByDateAscending = function(a, b) {
    return a - b;
  };
  self.dates = self.parseData(this.guesses);
}



function DistributionTableDirective() {
  return {
    replace: true,
    restrict: 'E',
    scope: {
      guesses: '='
    },
    templateUrl: 'reports/distribution-table.html',
    controller: DistributionTableController,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

angular.module(window.appName)
       .directive('gsDistributionTable', DistributionTableDirective);
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
