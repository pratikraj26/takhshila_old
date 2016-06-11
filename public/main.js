var app = angular.module('takhshila', ['ngRoute', 'ngCookies', 'angularify.semantic'])

// .factory('authInterceptor', function ($rootScope, $q, $location) {
//     return {
//         // Add authorization token to headers
//         request: function (config) {
//             config.headers = config.headers || {};
//             var token = $rootScope.token;
//             config.headers['x-auth-token'] = token;
//             return config;
//         }
//     };
// })
//
.run(function($cookies, $rootScope){
  $rootScope.loggedInToken = null;
  if($cookies.get('loggedInToken') !== undefined && $cookies.get('loggedInToken') !== null){
    $rootScope.loggedInToken = $cookies.get('loggedInToken');
  }
})

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
