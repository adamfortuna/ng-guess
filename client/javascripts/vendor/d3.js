(function() {
'use strict';

angular.module(window.appName)
.factory('d3', ['$window',
  function($window) {
    return $window.d3;
  }
]);

})();
