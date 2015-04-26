(function() {
'use strict';

function test() {
  debugger
}

function routes($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'pages/items/index.html',
      controller: 'ItemIndexController',
      controllerAs: 'ctrl'
    })

    // Single Page for a specific item
    .when('/items/:id', {
      templateUrl: 'pages/items/show.html',
      controller: 'ItemShowController',
      controllerAs: 'ctrl'
    })

    .otherwise({redirectTo: '/'});
}

angular.module(window.appName).config(routes);

}());
