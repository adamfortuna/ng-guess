/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function DistributionChartController(d3, $scope) {
  var self = this;
  this.margin = {
      top: 10,
      right: 25,
      bottom: 30,
      left: 25
    };
  this.updateDuration = 500;
  this.width = 660 - this.margin.left - this.margin.right;
  this.height = 400 - this.margin.top - this.margin.bottom;
  this.monthFormat = d3.time.format("%Y-%m");
  this.dayFormat = d3.time.format("%B %e, %Y");

  $scope.$watch('ctrl.guesses', function(data) {
    if(self.isWatching) {
      self.update(data);
    }
  });

  this.sortByDateAscending = function(a, b) {
    return a - b;
  };

  this.timeForKey = function(key) {
    var t = key.split('-');
    return new Date(t[0], t[1], 1);
  };

  this.parseData = function(data) {
    var dates = data.sort(data, this.sortByDateAscending);
    return d3.nest().key(function(d) {
      return self.monthFormat(new Date(d));
    }).entries(dates);
  };

  this.update = function(rawData) {
    if(this.svg) {
      var data = this.parseData(rawData);
      this.updateScales(data);
      this.updateAxis(data);
      this.updateLine(data);
      this.updateMeanLine(rawData);
    }
  };

  this.updateScales = function(data) {
    this.x.domain(d3.extent(data, function(d) {
      return self.timeForKey(d.key);
    }));
    this.y.domain(d3.extent(data, function(d) {
      return d.values.length;
    }));
  };

  // Update the X-axis
  this.updateAxis = function(data) {
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient('bottom')
      .tickFormat(d3.time.format('%B'))
      .ticks(data.length);

    this.xAxisElement.call(this.xAxis);
  };

  this.updateLine = function(data) {
    this.path.datum(data)
      .transition()
        .duration(this.updateDuration)
      .attr('d', this.line);
  };

  this.updateMeanLine = function(data) {
    var mean = new Date(d3.mean(data));

    if(!this.medianGroup) {
      this.medianGroup = this.svg.append("g")
        .attr('class', 'date--group')
        .attr("transform", "translate(" + this.x(mean) + "," + 0 + ")");
    } else {
      this.medianGroup.transition()
            .duration(this.updateDuration * 2)
            .ease("linear")
          .attr("transform", "translate(" + this.x(mean) + "," + 0 + ")");
    }

    if(!this.meanLine) {
      // Add the mean line
      this.meanLine = this.medianGroup.append('line')
        .attr('class', 'date--line')
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", this.height)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
      // Add a box
      this.medianGroup.append("rect")
         .attr('class', 'date--background')
         .attr('x', 0)
         .attr('height', 30)
         .attr('width', 200);
      // Add text for the line
      this.meanText = this.medianGroup.append("text")
        .attr('class', 'date--text')
        .attr("y", 10)
        .attr('x', 10)
        .attr("dy", ".71em")
        .style("text-anchor", "begin");
    }
    this.meanText.text('Our Guess: ' + this.dayFormat(mean));
  };

  this.startChart = function() {
    var data = this.parseData(this.guesses);

    this.x = d3.time.scale().range([0, this.width]);
    this.y = d3.scale.linear().range([this.height, 0]);
    this.updateScales(data);
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient('bottom')
      .tickFormat(d3.time.format('%B'))
      .ticks(data.length);


    // Draw main svg container
    this.svg = d3.select(this.el[0]).append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Draw X-axis
    this.xAxisElement = this.svg.append('g')
      .attr('class', 'x axis x-axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis);

    // Draw Main Line
    this.line = d3.svg.line()
      .interpolate('cardinal') // or basis
      .x(function(d) {
        return self.x(self.timeForKey(d.key));
      })
      .y(function(d) {
        return self.y(d.values.length);
      });

    this.path = this.svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', this.line);
    // Add an animation to main line
    if(this.animate) {
      var totalLength = this.path.node().getTotalLength();
      this.path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
    }

    // Draw Median Line
    this.updateMeanLine(this.guesses);

    setTimeout(function() {
      self.isWatching = true;
    }, 3000);
  };
}



function DistributionChartDirective() {
  return {
    replace: true,
    restrict: 'E',
    scope: {
      guesses: '=',
      guessDate: '=',
      animate: '='
    },
    template: '<div></div>',
    controller: DistributionChartController,
    controllerAs: 'ctrl',
    bindToController: true,
    link: function(scope, el, attrs, ctrl) {
      el.empty();
      ctrl.el = el;
      ctrl.startChart();
    }
  };
}

angular.module(window.appName)
       .directive('gsDistributionChart', DistributionChartDirective);
}());
