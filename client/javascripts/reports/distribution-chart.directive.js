/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function DistributionChartController() {
  this.generateDates = function() {
    var dates = [];
    for (var i = 0; i < 1000; i++) {
      var daysFromNow = self.normal() * 200,
        future = new Date();
      future.setDate(future.getDate() + 200 + daysFromNow);
      dates.push(future);
    }
    return dates.sort(this.sortByDateAscending);
  };

  this.normal = function() {
    var nsamples = 6, sigma = 1, mu = 0;

    var runTotal = 0;
    for (var i = 0; i < nsamples; i++) {
      runTotal += Math.random();
    }

    var normal = sigma * (runTotal - nsamples / 2) / (nsamples / 2) + mu;
    return normal;
  };

  this.getSundayFromWeek = function(week) {
    var tokens = week.split('-'),
      year = tokens[0],
      weekNum = tokens[1];

    var sunday = new Date(year, 0, (1 + (weekNum - 1) * 7));
    while (sunday.getDay() !== 0) {
      sunday.setDate(sunday.getDate() - 1);
    }
    return sunday;
  };

  // Dates will be cast to numbers automagically
  this.sortByDateAscending = function(a, b) {
    return a - b;
  };
}



function DistributionChartDirective(d3) {
  return {
    replace: true,
    restrict: 'E',
    scope: {
      guesses: '=',
      guessDate: '='
    },
    template: '<div><p>guess: {{ctrl.guessDate}}</p></div>',
    controller: DistributionChartController,
    controllerAs: 'ctrl',
    bindToController: true,
    link: function(scope, el, attrs, ctrl) {
      el.empty();

      console.log('ctrl.guessDate', ctrl.guessDate);
      console.log('ctrl.guesses.length', ctrl.guesses.length);

      var dates = ctrl.guesses.sort(ctrl.guesses, ctrl.sortByDateAscending),
        mean = new Date(d3.mean(dates)),
        week = d3.time.format("%Y-%U"),
        fullDay = d3.time.format("%B %e, %Y"),
        data = d3.nest().key(function(d) {
          return week(new Date(d));
        }).entries(dates);

      var margin = {
          top: 10,
          right: 25,
          bottom: 30,
          left: 25
        },
        width = 660 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

      var x = d3.time.scale()
        .range([0, width])
        .domain(d3.extent(data, function(d) {
          return ctrl.getSundayFromWeek(d.key);
        }));

      var y = d3.scale.linear()
        .range([height, 0])
        .domain(d3.extent(data, function(d) {
          return d.values.length;
        }));

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format('%B'));

      var line = d3.svg.line()
        .interpolate('cardinal') // or basis
        .x(function(d) {
          return x(ctrl.getSundayFromWeek(d.key));
        })
        .y(function(d) {
          return y(d.values.length);
        });

      var svg = d3.select(el[0]).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);





      var path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

      // Add an animation
      var totalLength = path.node().getTotalLength();
      path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease("linear")
        .attr("stroke-dashoffset", 0);




      // Median Line
      var medianGroup = svg.append("g")
        .attr('class', 'date--group')
        .attr("transform", "translate(" + x(mean) + "," + 0 + ")");
      // Add the mean line
      medianGroup.append('line')
        .attr('class', 'date--line')
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
      // Add a box
      medianGroup.append("rect")
         .attr('class', 'date--background')
         .attr('x', 0)
         .attr('height', 30)
         .attr('width', 180);
      // Add text for the line
      medianGroup.append("text")
        .attr('class', 'date--text')
        .attr("y", 10)
        .attr('x', 10)
        .attr("dy", ".71em")
        .style("text-anchor", "begin")
        .text('Our Guess: ' + fullDay(mean));


      // Guess Line
      if(ctrl.guessDate) {
        var guessGroup = svg.append("g")
          .attr('class', 'date--group')
          .attr("transform", "translate(" + x(ctrl.guessDate) + "," + 0 + ")");
        // Add the mean line
        guessGroup.append('line')
          .attr('class', 'date--line')
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", height)
          .attr("stroke-width", 2)
          .attr("stroke", "black");
        // Add a box
        guessGroup.append("rect")
           .attr('class', 'date--background')
           .attr('x', -160)
           .attr('height', 30)
           .attr('width', 160);
        // Add text for the line
        guessGroup.append("text")
          .attr('class', 'date--text')
          .attr("y", 10)
          .attr('x', -10)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text('Your Guess: ' + fullDay(ctrl.guessDate));
      }
    }
  };
}

angular.module(window.appName)
       .directive('gsDistributionChart', DistributionChartDirective);
}());
