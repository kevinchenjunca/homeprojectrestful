const passport = require('passport');
const User = require('../models/user');
const config = require('./auth-config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt  = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

//Create local strategy
const localOptions = {usernameField: 'email'};
const localLogin = new LocalStrategy(localOptions, function(email, password, done){
  //verify this username and password
  //if it is the correct username and password, call done(null, user)
  //otherwise, call done(null, false)
  User.findOne({email: email}, function(err, user){
    if (err)   { return done(err);}  
    if (!user) { return done(null, false);}   
    // compare password - is `password` equals user.password?
    user.comparePassword(password, function(err, isMatch){
      if (err) { return done(err);}         
      if (!isMatch) { return done(null, false);}      
      if (user.active == false) {
          return done("You account has not been activated", false);
      }      
      return done(null, user);  //this will assign user model to request (e.g. req.user)
    })
  })
})

//Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};
//creater JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  //see if the user ID in the payload exists in our database
  //if it does, call 'done'
  //otherwise, call done without a user object
  User.findById(payload.sub, function(err, user){
    if (err) { return done(err, false);}
    if (user) {
      if (user.active == false) {
          //console.log("activation is called in");
          user.active=true;
          user.save(function(err){
            if (err) { return done(err, false)}
          });        
      }
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

//Tell passport to use this Strategy
passport.use(jwtLogin);
passport.use(localLogin);

//session false means no cookie
exports.jwt   = passport.authenticate('jwt', { session: false});
exports.local = passport.authenticate('local', { session: false });