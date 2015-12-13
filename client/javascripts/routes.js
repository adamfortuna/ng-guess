(function() {
'use strict';

function routes($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'pages/home/index.html',
      controller: 'IndexController',
      controllerAs: 'ctrl',
      resolve: { // Start the page as logged in, in case there's a refresh
        'currentUser': ['AuthService', function(AuthService) {
          return AuthService.prepareAuthentication();
        }]
      }
    })

    // Single Page for a specific item
    // .when('/items/:id', {
    //   templateUrl: 'pages/items/show.html',
    //   controller: 'ItemShowController',
    //   controllerAs: 'ctrl'
    // })

    .otherwise({redirectTo: '/'});
}

angular.module(window.appName).config(routes);

}());
