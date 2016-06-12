var token = require('./token.js');

var validateRequest = {

  validate:function(req, res, next){
  	var referer = req.headers['referer'];
  	if (typeof referer !== 'undefined'){
  		next();
  	}else{
  		res.sendStatus(403, "Forbidden");
  	}
  },

  ensureAuthorized:function(req, res, next) {
      var bearerToken;
      var loggedInToken = req.headers["loggedintoken"];
      var userAgent = req.headers["user-agent"];
      if (loggedInToken !== undefined) {
          var decodedToken = token.verifyJWT(loggedInToken, userAgent);
          if(decodedToken !== null){
            next();
          }else{
            res.sendFile('404.html', { root: __dirname +'/public/views' });
          }
      } else {
          res.sendFile('404.html', { root: __dirname +'/public/views' });
  				// res.sendStatus(403, "Forbidden");
      }
  }
}

module.exports = validateRequest;
