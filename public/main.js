var app = angular.module('takhshila', ['ngRoute', 'ngCookies', 'angularify.semantic'])

.factory('authInterceptor', function ($rootScope, $q, $location, $cookies) {
    return {
        // Add authorization token to headers
        request: function (config) {
            config.headers = config.headers || {};
            if($cookies.get('loggedInToken') !== undefined && $cookies.get('loggedInToken') !== null){
              config.headers['loggedInToken'] = $cookies.get('loggedInToken');
            }
            return config;
        }
    };
})

.run(function($cookies, $rootScope){
  $rootScope.loggedInToken = null;
  if($cookies.get('loggedInToken') !== undefined && $cookies.get('loggedInToken') !== null){
    $rootScope.loggedInToken = $cookies.get('loggedInToken');
  }
})

.config(function ($routeProvider, $locationProvider, $httpProvider) {
  $httpProvider.useApplyAsync(true);
  $httpProvider.interceptors.push('authInterceptor');

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

  .when('/live-class/:roomId', {
    templateUrl: 'secureViews/live-class.html',
    controller: 'LiveCLassCtrl'
  })

  .when('/404', {
    templateUrl: 'views/404.html',
    controller: '404Ctrl'
  })

  .otherwise({
    redirectTo: '/404'
  });

  $locationProvider.html5Mode(true);
});
