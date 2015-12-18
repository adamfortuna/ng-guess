/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function DistributionTableController(d3, $scope) {
  var self = this;
  this.monthFormat = d3.time.format("%Y-%m");

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
