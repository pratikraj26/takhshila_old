// Server code starts
var express         = require('express'),
    app             = express(),
    server          = require('http').createServer(app),
    io              = require('socket.io').listen(server),
    validator       = require('validator'),
    md5             = require('md5'),
		bodyParser      = require('body-parser'),
		device				  = require('express-device'),
		uncapitalize	  = require('express-uncapitalize'),
		slash	          = require('./slash.js'),
    config          = require('./config.js'),
    token           = require('./token.js'),
    validateRequest = require('./validateRequest'),
    db              = require('./db'),
    onlineUsers     = [],
    liveClasses     = {},
    peers           = {};

app.enable('strict routing');

app.use(slash());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(device.capture({ parseUserAgent: true }));

device.enableDeviceHelpers(app);
device.enableViewRouting(app);

app.get('/views*', validateRequest.validate);

app.get('/secureViews/*', validateRequest.validate, validateRequest.ensureAuthorized);

app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use(express.static(__dirname + '/public'));

// The below middleware cannot be used above the above middleware because some static files have names in capital letters
app.use(uncapitalize());

// The following middleware in case someone access any link directly and not via index
app.get('/*', function(req, res, next) {
	res.sendFile('index.html', { root: __dirname +'/public' });
});

server.listen(config.port, function(){
	console.log("Server listening on port " + config.port);
  db.connectDb();
});

io.on('connection', function(client) {

  // for(item in client.handshake.headers){
  //   if(item == "user-agent"){
  //     console.log(client.handshake.headers[item]);
  //   }
  // }

  // console.log(client.handshake.query);

  client.userAgent = client.handshake.headers['user-agent'];
  client.userAuthenticated = false;
  client.userProfile = null;

  client.on('authenticate', function(data, callback){
    var output = {
      success: false,
      authentication: false,
      user_data: null
    };

    if(!client.userAuthenticated || client.userProfile === null){
      var loggedInToken = data.loggedInToken;

      if(loggedInToken === undefined || loggedInToken === null || loggedInToken == 'null'){
        client.userAuthenticated = false;
        client.userProfile = null;

        output.success = true;
        output.authentication = false;
        output.user_data = null;
      }else{
        var decodedToken = token.verifyJWT(loggedInToken, client.userAgent);
        if(decodedToken !== null){
          client.userAuthenticated = true;
          client.userProfile = {
            'user_id' : decodedToken.user_id,
            'name'    : decodedToken.name,
            'email'   : decodedToken.email
          };
          if(onlineUsers.indexOf(client.userProfile.user_id) == -1){
            onlineUsers[client.userProfile.user_id] = client;
          }else{
            onlineUsers.splice(onlineUsers.indexOf(client.userProfile.user_id), 1);
            onlineUsers[client.userProfile.user_id] = client;
          }
          output.success = true;
          output.authentication = true;
          output.user_data = client.userProfile;
        }
      }
    }else{
      output.success = true;
      output.authentication = true;
      output.user_data = client.userProfile;
    }

    callback(output);
  });

  client.on('disconnect', function(){
    if(client.userAuthenticated){
      client.userAuthenticated = false;
      if(onlineUsers.indexOf(client.userProfile.user_id) != -1){
        onlineUsers.splice(onlineUsers.indexOf(client.userProfile.user_id), 1);
      }
    }
    return false;
  });

  client.on('register', function(data, callback){
    var output = {
      success: false,
      error: null,
      data: null
    };
    if(!client.userAuthenticated){
      for(var item in data){
        data[item] = validator.trim(data[item]);
        data[item] = validator.escape(data[item]);
      }

      if(data.first_name === null || data.first_name === undefined){
        output.error = "Invalid details: First Name";
      }
      if(data.last_name === null || data.last_name === undefined){
        output.error = "Invalid details: Last Name";
      }
      if(data.email === null || data.email === undefined){
        output.error = "Invalid details: Email";
      }else{
        if(!validator.isEmail(data.email)){
          output.error = "Invalid email ID.";
        }
      }
      if(data.password === null || data.password === undefined){
        output.error = "Invalid details: Password";
      }
      if(data.user_type === null || data.user_type === undefined){
        data.user_type = 'student';
      }

      if(output.error === null){
        db.getUserByEmail(data.email, function(response){
          if(response.success){
            if(response.data === null){
              db.addUser(data, function(response){
                if(response.success){
                  var publicProfile = {
                    'user_id' : response.user_data._id,
                    'name' : response.user_data.name,
                    'email' : response.user_data.email
                  };
                  var loggedInToken = token.generateJWT(publicProfile, client.userAgent);
                  output.success = true;
                  output.data = publicProfile;
                  output.loggedInToken = loggedInToken;
                  client.userAuthenticated = true;
                  client.userProfile = publicProfile;
                }else{
                  output.error = response.error;
                }
                callback(output);
              });
            }else{
              output.error = "The email ID is already registered.";
              callback(output);
            }
          }else {
            output.error = response.error;
            callback(output);
          }
        });
      }else{
        callback(output);
      }
    }else{
      output.error = "You are already logged in. Please logout and then try registering.";
      callback(output);
    }
  });

  client.on('login', function(data, callback){
    var output = {
      success: false,
      error: null,
      data: null
    };
    if(!client.userAuthenticated){
      for(var item in data){
        data[item] = validator.trim(data[item]);
        data[item] = validator.escape(data[item]);
      }

      if(data.email === null || data.email === undefined){
        output.error = "Invalid details: Email";
      }else{
        if(!validator.isEmail(data.email)){
          output.error = "Invalid email ID.";
        }
      }
      if(data.password === null || data.password === undefined){
        output.error = "Invalid details: Password";
      }

      if(output.error === null){
        db.validateDetails(data, function(response){
          if(response.success){
            if(response.data !== null){
              var publicProfile = {
                'user_id' : response.data._id,
                'name'    : response.data.name,
                'email'   : response.data.email
              };
              var loggedInToken = token.generateJWT(publicProfile, client.userAgent);
              output.success = true;
              output.data = publicProfile;
              output.loggedInToken = loggedInToken;
              client.userAuthenticated = true;
              client.userProfile = publicProfile;
            }else{
              output.error = "The email ID and/or password is incorrect.";
            }
          }else{
            output.error = response.error;
          }
          callback(output);
        });
      }else{
        callback(output);
      }
    }else{
      output.error = "You are already logged in. Please logout and then try login again.";
      callback(output);
    }
  });

  client.on('peer.connect', function(data, callback){
    var output = {
      success: false,
      error: null,
      data: null
    };
    if(!client.userAuthenticated){
      output.error = "You are not authorized to join this room.";
      callback(output);
    }else{
      var class_id = data.class_id;
      var peer_id = data.peer_id;

      db.getClass(class_id, function(response){
        if(response.success){
          if(response.data === null){
            output.error = "Invalid class ID.";
            callback(output);
          }else{
            client.class_id = class_id;
            client.peer_id = peer_id;
            if(liveClasses[class_id] === undefined){
              liveClasses[class_id] = [];
            }
            if(liveClasses[class_id].indexOf(client.userProfile.user_id) == -1){
              liveClasses[class_id][client.userProfile.user_id] = client;
            }
            for(user_id in liveClasses[class_id]){
              if(user_id != client.userProfile.user_id){
                var data = {
                  user_id: user_id,
                  peer_id: client.peer_id
                };
                liveClasses[class_id][user_id].emit('peer.connected', data);
              }
            }
            output.success = true;
            callback(output);
            // console.log(liveClasses);
          }
        }else{
          output.error = response.error;
          callback(output);
        }
      });
    }
  });

  client.on('msg', function (data) {
    console.log("New msg");
    console.log(data);
    if (liveClasses[client.class_id][data.to_user_id]) {
      console.log('Redirecting message to', data.to_user_id, 'by', data.from_user_id);
      liveClasses[client.class_id][data.to_user_id].emit('msg', data);
    } else {
      console.warn('Invalid user');
    }
  });

});
