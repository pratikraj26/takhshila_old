app

.controller('MainCtrl', function($scope, $rootScope, $timeout, $cookies, socket) {
  $rootScope.loggedIn = null;
  $rootScope.page = null;
  $scope.scroll = null;
  $scope.navStick = false;
  $scope.current = 'default';

  $rootScope.registerProcess = false;
  $rootScope.loginProcess = false;
  $rootScope.registerData = {};
  $rootScope.loginData = {};
  $rootScope.registerData.user_type = 'student';

  $rootScope.$watch('loggedInToken', function(loggedInToken){
    if(loggedInToken !== null){
      if(!$rootScope.loggedIn){
        var data = {
          loggedInToken: $rootScope.loggedInToken
        };
        socket.emit('authenticate', data, function(response){
          if(response.success){
            if(response.authentication){
              $rootScope.loggedIn = true;
              $rootScope.currentUser = response.user_data;
              console.log("You are authenticated");
            }else{
              console.log("You are not authenticated");
              $rootScope.loggedIn = false;
              $rootScope.currentUser = null;
              $cookies.remove('loggedInToken');
            }
          }
        });
      }
    }
  });

  $rootScope.register = function(){
    $rootScope.registerProcess = true;
    var data = {
      'first_name': $rootScope.registerData.first_name,
      'last_name': $rootScope.registerData.last_name,
      'email': $rootScope.registerData.email,
      'user_type': $rootScope.registerData.user_type,
      'password': $rootScope.registerData.password
    };

    socket.emit('register', data, function(response){
      $rootScope.registerProcess = false;
      console.log(response);
      if(response.success){
        $rootScope.loggedIn = true;
        $rootScope.currentUser = response.data;
        $cookies.put('loggedInToken', response.loggedInToken);
        $scope.close_login_modal();
      }else{
        alert(response.error);
      }
    });
  }

  $rootScope.login = function(){
    $rootScope.loginProcess = true;
    var data = {
      'email': $rootScope.loginData.email,
      'password': $rootScope.loginData.password
    };

    socket.emit('login', data, function(response){
      $rootScope.loginProcess = false;
      console.log(response);
      if(response.success){
        $rootScope.loggedIn = true;
        $rootScope.currentUser = response.data;
        $cookies.put('loggedInToken', response.loggedInToken);
        $scope.close_login_modal();
      }else{
        alert(response.error);
      }
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
    $rootScope.registerData = {};
    $scope.show_login_modal = false;
  }
})

.controller('IndexCtrl', function($scope, $rootScope, socket) {
  $rootScope.page = "Index";
  $rootScope.hideNavbar = false;
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

.controller('LiveCLassCtrl', function($scope, $location, $window, $rootScope, $timeout, $cookies, $routeParams, $sce, socket, VideoStream) {
  $scope.localVdoURL = null;
  $scope.remoteVdoURL = null;
  $rootScope.page = "LiveClass";
  $rootScope.$watch('loggedIn', function(loggedIn){
    if(loggedIn != null){
      if(!$rootScope.loggedIn){
        console.log("You are not logged In");
        $location.path('/');
      }else{
        if(!$routeParams.class_id){
          console.log("Class ID is not set");
          $location.path('/');
        }else{
          var stream,
              peer = new Peer({key: 'lwjd5qra8257b9'});

          var handleCall = function(call){
            if($scope.existingCall){
              $scope.existingCall.close();
            }
            call.on('stream', function(remoteStream){
              $scope.remoteVdoURL = $sce.trustAsResourceUrl(URL.createObjectURL(remoteStream));
            });
            $scope.existingCall = call;
          }

          peer.on('open', function(peer_id) {
            VideoStream.get()
            .then(function(s){
              $scope.localStream = s;
              $scope.localVdoURL = $sce.trustAsResourceUrl(URL.createObjectURL($scope.localStream));
              var data = {
                class_id: $routeParams.class_id,
                peer_id: peer_id
              };
              socket.emit('peer.connect', data, function(response){
                if(response.success){
                  console.log("Peer connected with id# " + peer_id);
                }else{
                  alert(response.error);
                  $location.path('/');
                }
              });
            }, function () {
              $scope.error = 'No audio/video permissions. Please refresh your browser and allow the audio/video capturing.';
              console.log($scope.error);
            });
          });

          socket.on('peer.connected', function(response){
            var connection_user_id = response.user_id;
            var connection_peer_id = response.peer_id;
            var call = peer.call(connection_peer_id, $scope.localStream);
            handleCall(call);
          });

          peer.on('call', function(call){
            console.log(call);
            console.log("Receiving a call from #" + call.peer);
            call.answer($scope.localStream);
            handleCall(call);
          });

          peer.on('error', function(err){
            console.log(err.message);
          });
        }

        // if (!window.RTCPeerConnection || !navigator.getUserMedia) {
        //   $scope.error = 'WebRTC is not supported by your browser. You can try the app with Chrome and Firefox.';
        //   return;
        // }
        //
        // var stream;
        // console.log("Class join");
        // VideoStream.get()
        // .then(function (s) {
        //   stream = s;
        //   Room.init(stream);
        //   stream = URL.createObjectURL(stream);
        //   if (!$routeParams.roomId) {
        //     Room.createRoom()
        //     .then(function (roomId) {
        //       $location.path('/room/' + roomId);
        //     });
        //   } else {
        //     Room.joinClass($routeParams.roomId);
        //   }
        // }, function () {
        //   $scope.error = 'No audio/video permissions. Please refresh your browser and allow the audio/video capturing.';
        //   console.log($scope.error);
        // });
        // $scope.peers = [];
        // Room.on('peer.stream', function (peer) {
        //   console.log('Client connected, adding new stream');
        //   $scope.peers.push({
        //     id: peer.id,
        //     stream: URL.createObjectURL(peer.stream)
        //   });
        // });
        // Room.on('peer.disconnected', function (peer) {
        //   console.log('Client disconnected, removing stream');
        //   $scope.peers = $scope.peers.filter(function (p) {
        //     return p.id !== peer.id;
        //   });
        // });
        //
        // $scope.getLocalVideo = function () {
        //   return $sce.trustAsResourceUrl(stream);
        // };
      }
    }
  });
})

.controller('404Ctrl', function($rootScope, $scope, $cookies, socket){

})
;
