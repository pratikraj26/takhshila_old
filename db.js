var mongoose  = require('mongoose'),
    md5       = require('md5');

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
  location: {
    type: mongoose.Schema.Types.Mixed
  },
  country_code: {
    type: String
  },
  dial_code: {
    type: String
  },
  phone: {
    type: String
  },
  user_type: {
    type: String,
    default: 'student'
  },
  joined_on : {
    type: Date,
    default: Date.now
  }
});

var userSession = mongoose.Schema({
  user_id: String,
  token: String,
  socket: mongoose.Schema.Types.Mixed,
  device_id: String,
  logged_in_on: {
    type: Date,
    default: Date.now
  }
});

var userClasses = mongoose.Schema({
  student_id: String,
  teacher_id: String,
  class_on: {
    type: Date
  },
  booked_on: {
    type: Date,
    default: Date.now
  }
});

var user = mongoose.model('user', userSchema);
var userSession = mongoose.model('userSession', userSession);
var userClasses = mongoose.model('userClasses', userClasses);

module.exports = {

  connectDb: function(){
    mongoose.connect('mongodb://localhost/liveclass', function(err){
      if(err){
        console.log(err);
      }else {
        console.log("Database connected");
      }
    });
  },

  addUser: function(data, callback){
    var output = {
      success: false,
      data: null,
      error: null
    };
    var newUser = new user;
    newUser.name.first_name = data.first_name;
    newUser.name.last_name = data.last_name;
    newUser.email = data.email;
    newUser.password = md5(data.password);

    newUser.save(function(err, savedData){
      if(err){
        output.error = "Oops! Something went wrong. We are working to fix this.";
      }else {
        output.success = true;
        output.data = "User registered successfully";
        output.user_data = savedData;
      }
      callback(output);
    });
  },

  getUserById: function(user_id, callback){
    var output = {
      success: false,
      data: null,
      error: null
    };
    user.findOne({'_id': user_id}, '_id name email user_type country_code dial_code phone joined_on', function(err, result){
      if(err){
        output.error = "Oops! Something went wrong. We are working to fix this.";
      }else {
        output.success = true;
        output.data = result;
      }
      callback(output);
    });
  },

  getUserByEmail: function(email, callback){
    var output = {
      success: false,
      data: null,
      error: null
    };
    user.findOne({'email': email}, '_id name email user_type country_code dial_code phone joined_on', function(err, result){
      if(err){
        output.error = "Oops! Something went wrong. We are working to fix this.";
      }else {
        output.success = true;
        output.data = result;
      }
      callback(output);
    });
  },

  deleteAllUsers: function(){
    user.find({}, function(err, result){
      for(var i in result){
        result[i].remove(function(err){
          if(err){
            console.log(err);
          }
        })
      }
    });
  }
}
