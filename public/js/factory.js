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

.factory('VideoStream', function ($q) {
  var stream;
  return {
    get: function () {
      if (stream) {
        return $q.when(stream);
      } else {
        var d = $q.defer();
        navigator.getUserMedia({
          video: true,
          audio: true
        }, function (s) {
          stream = s;
          d.resolve(stream);
        }, function (e) {
          d.reject(e);
        });
        return d.promise;
      }
    }
  };
})

// .factory('Room', function ($rootScope, $q, $location, socket) {
//
//   var iceConfig = { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]},
//   peerConnections = {},
//   class_id,
//   stream;
//
//   function getPeerConnection(user_id) {
//     if (peerConnections[user_id]) {
//       return peerConnections[user_id];
//     }
//     var pc = new RTCPeerConnection(iceConfig);
//     peerConnections[user_id] = pc;
//     pc.addStream(stream);
//     pc.onicecandidate = function (evnt) {
//       var message = {
//         from_user_id: $rootScope.currentUser.user_id,
//         to_user_id: user_id,
//         ice: evnt.candidate,
//         type: 'ice'
//       };
//       socket.emit('msg', message);
//     };
//     pc.onaddstream = function (evnt) {
//       console.log('Received new stream');
//       api.trigger('peer.stream', [{
//         user_id: user_id,
//         stream: evnt.stream
//       }]);
//       if (!$rootScope.$$digest) {
//         $rootScope.$apply();
//       }
//     };
//     console.log(pc);
//     return pc;
//   }
//
//   function makeOffer(user_id) {
//     var pc = getPeerConnection(user_id);
//     pc.createOffer(function (sdp) {
//       pc.setLocalDescription(sdp);
//       console.log('Creating an offer for', user_id);
//       var message = {
//         from_user_id: $rootScope.currentUser.user_id,
//         to_user_id: user_id,
//         sdp: sdp,
//         type: 'sdp-offer'
//       };
//       socket.emit('msg', message);
//     }, function (e) {
//       console.log(e);
//     },
//     { mandatory: { OfferToReceiveVideo: true, OfferToReceiveAudio: true }});
//   }
//
//   function handleMessage(data) {
//     var pc = getPeerConnection(data.by);
//     switch (data.type) {
//       case 'sdp-offer':
//       pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
//         console.log('Setting remote description by offer');
//         pc.createAnswer(function (sdp) {
//           pc.setLocalDescription(sdp);
//           socket.emit('msg', { from_user_id: $rootScope.currentUser.user_id, to_user_id: data.from_user_id, sdp: sdp, type: 'sdp-answer' });
//         });
//       });
//       break;
//       case 'sdp-answer':
//       pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
//         console.log('Setting remote description by answer');
//       }, function (e) {
//         console.error(e);
//       });
//       break;
//       case 'ice':
//       if (data.ice) {
//         console.log('Adding ice candidates');
//         pc.addIceCandidate(new RTCIceCandidate(data.ice));
//       }
//       break;
//     }
//   }
//
//   var connected = false;
//
//   function addHandlers(socket) {
//     socket.on('peer.connected', function (params) {
//       makeOffer(params.user_id);
//     });
//     socket.on('peer.disconnected', function (data) {
//       api.trigger('peer.disconnected', [data]);
//       if (!$rootScope.$$digest) {
//         $rootScope.$apply();
//       }
//     });
//     socket.on('msg', function (data) {
//       handleMessage(data);
//     });
//   }
//
//   var api = {
//     joinClass: function (class_id, callback) {
//       console.log("Joining the class");
//       if (!connected) {
//         var data = {
//           class_id: class_id
//         };
//         socket.emit('join.class', data, function (response) {
//           if(response.success){
//             // currentId = id;
//             // roomId = roomid;
//             connected = true;
//           }else{
//             alert(response.error);
//             $location.path('/');
//           }
//         });
//       }
//     },
//     createRoom: function () {
//       var d = $q.defer();
//       socket.emit('init', null, function (roomid, id) {
//         d.resolve(roomid);
//         roomId = roomid;
//         currentId = id;
//         connected = true;
//       });
//       return d.promise;
//     },
//     init: function (s) {
//       stream = s;
//     }
//   };
//
//   EventEmitter.call(api);
//   Object.setPrototypeOf(api, EventEmitter.prototype);
//
//   addHandlers(socket);
//   return api;
// });
