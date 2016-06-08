var authorize = {

  validateRequest:function(req, res, next){
  	var referer = req.headers['referer'];
  	if (typeof referer !== 'undefined'){
  		next();
  	}else{
  		res.sendStatus(403, "Forbidden");
  	}
  },

  ensureAuthorized:function(req, res, next) {
      var bearerToken;
      var bearerHeader = req.headers["authorization"];
      if (typeof bearerHeader !== 'undefined') {
          var bearer = bearerHeader.split(" ");
          bearerToken = bearer[1];
          req.token = bearerToken;
          next();
      } else {
          res.sendFile('404.html', { root: __dirname +'/public/views' });
  				// res.sendStatus(403, "Forbidden");
      }
  }
}

module.exports = authorize;
