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
