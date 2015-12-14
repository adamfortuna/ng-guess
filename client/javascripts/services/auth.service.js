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
