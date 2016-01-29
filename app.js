var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server);

var config = {
	port: 1337
}

var validateRequest = function(req, res, next){
	var referer = req.headers['referer'];
	if (typeof referer !== 'undefined'){
		next();
	}else{
		res.sendStatus(403, "Forbidden");
	}
}

var ensureAuthorized = function(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        // res.sendFile('404.html', { root: __dirname +'/public/views' });
				res.sendStatus(403, "Forbidden");
    }
}


app.all('/views*', validateRequest);

app.all('/secureViews/*', validateRequest, ensureAuthorized);

app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use(express.static(__dirname + '/public'));

app.all('/*', function(req, res, next) {
	res.sendFile('index.html', { root: __dirname +'/public' });
});

server.listen(config.port, function(){
	console.log("Server listening on port " + config.port);
});


io.on('connection', function(client) {
	// console.log('Client connected...');
	// console.log(client.id);

	client.on('join', function(data) {
		// console.log(data);
		// client.emit('joinConfirm', 'Hello! From server.');
	});

});
