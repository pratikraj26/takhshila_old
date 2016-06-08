// Server code starts
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose'),
    authorize = require('./authorize'),
		bodyParser    = require('body-parser'),
		device				= require('express-device'),
		uncapitalize	= require('express-uncapitalize'),
    online_users = [];

var config = {
	port: process.env.PORT || 3000
}

mongoose.connect('mongodb://localhost/liveclass', function(err){
  if(err){
    console.log(err);
  }else {
    console.log("Database connected");
  }
});

var userSchema = mongoose.Schema({
  name: {
    first_name: {
      type: String,
      lowercase: true,
      trim: true
    },
    last_name: {
      type: String,
      lowercase: true,
      trim: true
    }
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  password: String,
  country_code: String,
  dial_code: String,
  phone: Number,
  user_type: String,
  joined_on : {
    type: Date,
    Default: Date.now
  }
});

var userSession = mongoose.Schema({
  user_id: String,
  token: String,
  socket: mongoose.Schema.Types.Mixed,
  device_id: String,
  logged_in_on: {
    type: Date,
    Default: Date.now
  }
});

var userClasses = mongoose.Schema({
  student_id: String,
  teacher_id: String,
  class_on: {
    type: Date,
  },
  booked_on: {
    type: Date,
    Default: Date.now
  }
});

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
});


io.on('connection', function(client) {

});
