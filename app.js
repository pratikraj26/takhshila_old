// Server code starts
var express				= require('express');
var bodyParser    = require('body-parser');
var device				= require('express-device');
var uncapitalize	= require('express-uncapitalize');

var app						= express();
var server				= require('http').createServer(app);
var io						= require('socket.io').listen(server);

var middleWare = require('./middleWare');

var config = {
	port: process.env.PORT || 3000
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(device.capture({ parseUserAgent: true }));

device.enableDeviceHelpers(app);
device.enableViewRouting(app);

app.all('/views*', middleWare.validateRequest);

app.all('/secureViews/*', middleWare.validateRequest, middleWare.ensureAuthorized);

app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use(express.static(__dirname + '/public'));

// The below middleware cannot be used above the above middleware because some static files have names in capital letters
app.use(uncapitalize());

// The following middleware in case someone access any link directly and not via index
app.all('/*', function(req, res, next) {
	res.sendFile('index.html', { root: __dirname +'/public' });
});

server.listen(config.port, function(){
	console.log("Server listening on port " + config.port);
});


io.on('connection', function(client) {
	console.log('Client connected...');
	console.log(client.id);

	client.on('join', function(data) {
		console.log(data);
		client.emit('joinConfirm', 'Hello! From server.');
	});

});
