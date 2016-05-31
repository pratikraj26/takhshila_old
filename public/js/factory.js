app
.factory('Config', function(ApiEndpoint) {
  var apiBase = ApiEndpoint.url;
  return {
    apiBase : apiBase
  };
})
.factory('Server', function(ApiEndpoint) {
  var serverBase = ApiEndpoint.serverBase;
  return {
    serverBase : serverBase
  };
})

.factory('Api', function Api($location, $rootScope, $http, $q, Config) {
  var currentUser = {};
  var showToast = function(message) {
    if(window.cordova) {

    }
  }
  return {
    /**
    * Process Request
    */
    processRequest: function(data, callback) {
      var cb = callback || angular.noop;
      var deferred = $q.defer();
      $http.post(Config.apiBase, {
        data: data
      }, {
        headers : {
          'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).
      success(function(data) {
        deferred.resolve(data);
        return cb();
      }).
      error(function(err) {
        console.log (err );
        deferred.reject(err);
        return cb(err);
      }.bind(this));
      return deferred.promise;
    }
  };
});
