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
    self.auth = AuthService.user.auth;
    self.user = AuthService.user.current;
  });

  var ref = new Firebase(FIREBASE_URL + 'users');

  ref.on('value', function(snapshot) {
    self.usersCount = snapshot.numChildren();
  });

  ref.on('value', function(snapshot) {
    var guesses = [];
    snapshot.forEach(function(user) {
      guesses.push(user.val().guessDate);
    });

    self.guesses = _.compact(guesses);
  });
}

IndexController.$inject = ['_', 'AuthService', 'UserFactory', 'currentUser', 'FIREBASE_URL'];

angular.module(window.appName)
.controller('IndexController', IndexController);

}());
