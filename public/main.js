var app = angular.module('takhshila', ['ngRoute', 'angularify.semantic'])

.config(function ($routeProvider, $locationProvider) {
  $routeProvider

  .when('/', {
    templateUrl: 'views/index.html',
    controller: 'IndexCtrl'
  })

  .when('/teach', {
    templateUrl: 'views/teach.html',
    controller: 'TeachCtrl'
  })

  .when('/register', {
    templateUrl: 'views/register.html',
    controller: 'RegisterCtrl'
  })

  .when('/login', {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  })

  .when('/profile', {
    templateUrl: 'secureViews/profile.html',
    controller: 'ProfileCtrl'
  })

  .when('/404', {
    templateUrl: 'views/404.html'
  })

  .otherwise({
    redirectTo: '/404'
  });

  $locationProvider.html5Mode(true);
});
