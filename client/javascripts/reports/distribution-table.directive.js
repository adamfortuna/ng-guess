/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function DistributionTableController(d3, $scope) {
  var self = this;
  var columns = ['Month', 'Count'];
  this.monthFormat = d3.time.format("%Y-%m");

  $scope.$watch('ctrl.guesses', function(data) {
    self.update(self.parseData(data));
  });

  this.key = function key(month) {
    return month.key;
  }

  this.update = function(data) {
    // Create a <tr> for each month
    var rows = this.tbody.selectAll('tr')
        .data(data, this.key)
    rows.exit().remove();
    rows.enter().append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row};
            });
        })
        .enter()
        .append('td')
            .html(function(d) {
              if(d.column === 'Month') {
                return d.value.key;
              } else {
                return d.value.values.length;
              }
            })
  }

  this.parseData = function(data) {
    var dates = data.sort(data, this.sortByDateAscending);
    return d3.nest().key(function(d) {
      return self.monthFormat(new Date(d));
    }).entries(dates);
  };

  this.startTable = function() {
    var data = this.parseData(this.guesses);


    var table = d3.select(this.el[0]).append('table'),
        thead = table.append('thead');
    this.tbody = table.append('tbody');

    // append the header row
    thead.append("tr")
         .selectAll("th")
         .data(columns)
         .enter()
         .append("th")
           .text(function(column) { return column; });


    this.update(data);
  }
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
    bindToController: true,
    link: function(scope, el, attrs, ctrl) {
      ctrl.el = el;
      ctrl.startTable();
    }
  };
}

angular.module(window.appName)
       .directive('gsDistributionTable', DistributionTableDirective);
}());
