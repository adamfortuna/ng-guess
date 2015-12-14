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
