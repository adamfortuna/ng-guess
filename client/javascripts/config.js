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
