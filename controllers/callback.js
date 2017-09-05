const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../services/auth-config');
const nodeEmail = require("nodemailer");
const systemConfig = require("../services/system-config");
const STYLE = "color:#ffffff; text-decoration:none; display:inline-block; height:38px; line-height:38px; padding-top:0; padding-right:16px; padding-bottom:0; padding-left:16px; border:0; outline:0; background-color:#02b875; font-size:14px; font-style:normal; font-weight:400; text-align:center; white-space:nowrap; border-radius:999em";
const ROOT_URL = systemConfig.host;
const ADMIN = systemConfig.admin;

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({sub: user.id, iat: timestamp }, config.secret);  //iat: issued at the time
}

exports.activate = function(req, res) {  
  res.send({ message: 'Your account was successfully activated'});  
}

exports.access = function(req,res) {
  res.send({ message: 'Super secret code is ABC123'});
};

exports.signin = function(req,res,next) {
  //user has already had their email and password  auth'd
  //we just need to give them a token
  res.send({token: tokenForUser(req.user), isAdmin: req.user.isAdmin});
}

exports.signup = function(req,res,next) {
    const email = req.body.email;
    const password = req.body.password;
    const isAdmin = (email == ADMIN)?true: false;
    if (!email || !password) {
      res.status(422).send({error: 'You must provide email and password'});
    }
    User.findOne({email: email}, function(err, existingUser){
      if (err) { return next(err); };

      if (existingUser) {
        return res.status(422).send({error:'Email is in use'});
      };

      const user = new User({
          email: email,
          password: password,
          isAdmin: isAdmin,
          active: false
      });

      user.save(function(err){
        if (err) { return next(err);}
        let token = tokenForUser(user);
        //begin email sending process
        let url = ROOT_URL + "/activation?token=" + token;
        let emailBody = "<html><body><div>Welcome to sign up my home project, please click <a href='" + url + "' style='" + STYLE +"'>Create Acccount</a> to activate your account</div><br>If it does not work, copy this url to browser<pre>"+ url +"</pre></body></html>";
        let transport = nodeEmail.createTransport({
            service: 'gmail',
            auth: {
              user: 'kevin.chen.sp@gmail.com',
              pass: "x8w$xdd7kr7yj2"
            }
        });    
        const emailOptions = {
          from: "Kevin Chen's Home Project <kevin.chen.sp@gmail.com>",
          to: user.email,
          subject: "Please activate your account",
          generateTextFromHTML: false,
          text: ROOT_URL + "/activation?token=" + token,
          html: emailBody
        }       
        transport.sendMail(emailOptions, function(err,info){
          if (err) {
            return next(err);
          } else {           
            res.send({ message: 'Please check your email to activate your account, make sure to check your junk mail folder as well'});
          }
        })

        //end email sending
      });
    });
}
