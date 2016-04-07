app

.controller('MainCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = null;
  $scope.scroll = null;
  $scope.navStick = false;
  $scope.current = 'default';

  $rootScope.connectSocketIO = function(){
    socket.on('connect', function(data) {
      socket.emit('join', 'Hello World from client');
    });

    socket.on('joinConfirm', function(data){
      console.log(data);
    });
  }
  $scope.$watch('scroll', function(value){
    // console.log("The value is: " + value);
    if(value > 420){
      $scope.navStick = true;
    }else{
      $scope.navStick = false;
    }
  });

  $scope.show_login_modal = false;

  $scope.open_login_modal = function(){
    $scope.show_login_modal = true;
  }

  $scope.close_login_modal = function(){
    $scope.show_login_modal = false;
  }
})

.controller('IndexCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = "Index";
  $scope.setLevel = function(value){
    console.log("Clicked value is " + value);
  }
})

.controller('TeachCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = "Teach";
})

.controller('RegisterCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = "Register";
})

.controller('LoginCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = "Login";
})

.controller('ProfileCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = "Profile";
})

;
