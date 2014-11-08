var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy; //for fun
var User = mongoose.model('User');

module.exports = function(passport) {
    passport.serializeUser(function(user, callback){
        callback(null, user.id);
    });
    passport.deserializeUser(function(id, callback){
        User.findOne({_id: id}, function(err, user) {
            callback(err, user);
        })
    });
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, 
    function(email, password, callback) {
        //console.log(email, password);
        User.isValidCredentials(email, password, callback);
    }));
    //no facebook for timebeing

}