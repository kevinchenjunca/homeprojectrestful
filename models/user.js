const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define our model
const userSchema = new Schema({
  email    : {type: String, unique: true, lowercase: true},
  password : String,
  isAdmin: Boolean,
  active: Boolean
});

//On Save Hook, encrypt password
//Before saving a model, run this function
userSchema.pre('save', function(next) {
  //get access to the user model
  const user = this;

  if (user.active == true) {
    //this is activation request, we don't re-generate password
    next();
  } else {
    //pre save is triggered, new password is generated 
    //generate a salt, attach salt to hash to create a new hash
    bcrypt.genSalt(10, function(err, salt) {
      if (err) { return next(err);}
      bcrypt.hash(user.password, salt, null, function(err, hash){
        if (err) { return next(err);}
        user.password = hash;
        next();
      });
    });
  }
});


userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err,isMatch){
    if (err) { return callback(err);}
    callback(null, isMatch);
  })
}

// Create the model class
const userModelClass = mongoose.model('user', userSchema);


//Export the model
module.exports = userModelClass
