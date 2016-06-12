var jwt    = require('jsonwebtoken'),
    config = require('./config.js');


module.exports = {
  generateJWT: function(userProfile, userAgent){
    userProfile.userAgent = userAgent;
    return jwt.sign(userProfile, config.SECRET_KEY);
  },

  verifyJWT: function(token, userAgent){
    var decoded = jwt.verify(token, config.SECRET_KEY);
    if(decoded.userAgent == userAgent){
      return decoded;
    }
    return null;
  }
}
