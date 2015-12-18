/*eslint no-console: 0*/
/*eslint no-debugger: 0*/
(function() {
'use strict';
function ShareDirective() {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'guess/share.html'
  };
}

angular.module(window.appName)
.directive('gsShare', ShareDirective);

}());
