(function() {
'use strict';

angular.module(window.appName)
.factory('_', ['$window',
  function($window) {
    return $window._;
  }
]);

})();
