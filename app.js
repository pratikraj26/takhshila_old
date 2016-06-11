// Server code starts
var express       = require('express'),
    app           = express(),
    server        = require('http').createServer(app),
    io            = require('socket.io').listen(server),
    validator     = require('validator'),
    md5           = require('md5'),
    jwt           = require('jsonwebtoken'),
		bodyParser    = require('body-parser'),
		device				= require('express-device'),
		uncapitalize	= require('express-uncapitalize'),
    authorize     = require('./authorize'),
    db            = require('./db'),
    onlineUsers  = [];

var config = {
	port: process.env.PORT || 3000,
  SECRET_KEY: 'haxth@tbox23'
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(device.capture({ parseUserAgent: true }));

device.enableDeviceHelpers(app);
device.enableViewRouting(app);

app.get('/views*', authorize.validateRequest);

app.get('/secureViews/*', authorize.validateRequest, authorize.ensureAuthorized);

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

var generateJWT = function(userProfile, userAgent){
  userProfile.userAgent = userAgent;
  return jwt.sign(userProfile, config.SECRET_KEY);
}

var verifyJWT = function(token, userAgent){
  var decoded = jwt.verify(token, config.SECRET_KEY);
  if(decoded.userAgent == userAgent){
    return decoded;
  }

  return null;
}

io.on('connection', function(client) {

  // for(item in client.handshake.headers){
  //   if(item == "user-agent"){
  //     console.log(client.handshake.headers[item]);
  //   }
  // }

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
        var decodedToken = verifyJWT(loggedInToken, client.userAgent);
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
                  var loggedInToken = generateJWT(publicProfile, client.userAgent);
                  if(loggedInToken){
                    output.success = true;
                    output.data = publicProfile;
                    output.loggedInToken = loggedInToken;
                    client.userAuthenticated = true;
                    client.userProfile = publicProfile;
                  }else{
                    output.error = "You have been registered successfully. But an error occured during authentication. Please login.";
                  }
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

});
