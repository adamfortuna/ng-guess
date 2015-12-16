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
