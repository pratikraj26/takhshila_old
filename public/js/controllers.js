app

.controller('MainCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = null;

  socket.on('connect', function(data) {
    // socket.emit('join', 'Hello World from client');
  });
  socket.on('joinConfirm', function(data){
    // console.log(data);
  });
})

.controller('IndexCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = "Index";
})

.controller('RegisterCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = "Register";
})

.controller('LoginCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = "Login";
})

;
