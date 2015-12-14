(function() {
'use strict';

function routes($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'pages/index.html',
      controller: 'IndexController',
      controllerAs: 'ctrl',
      resolve: { // Start the page as logged in, in case there's a refresh
        'currentUser': ['AuthService', function(AuthService) {
          return AuthService.prepareAuthentication();
        }]
      }
    })

    .when('/about', {
      templateUrl: 'pages/about.html'
    })

    .otherwise({redirectTo: '/'});
}

angular.module(window.appName).config(routes);

}());
