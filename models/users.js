var mongoose = require('mongoose');
var hash = require('../utils/hash');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: String,
    name: String,
    salt: String,
    hash: String,
    facebook: {
        id: String,
        email: String,
        name: String
    }
});

/*var fbUsersSchema = new Schema({
    id: String,
    email: { type: String, lowercase: true},
    name: String
});*/

UserSchema.statics.signup = function(email, password, callback) {
    var User = this;
    hash(password, function(err, salt, hash) {
        if(err) throw err;
        User.create({
            email: email,
            salt: salt,
            hash: hash
        }, function(err, user) {
            if (err) throw err;
            callback(null, user);
        })
    });
};

UserSchema.statics.isValidCredentials = function(email, password, callback) { //Check user credentials
    this.findOne({email: email}, function(err, user) { //1. find user
        if (err) callback(err);
        if (!user) callback(null, false, { message: 'Incorrect mail'});
        hash(password, user.salt, function(err, hash) { //check password hashes
            if (err) callback(err);
            if (hash === user.hash) return callback(null, user);
            callback(null, false, { message: 'Incorrect password'});
        });
    });
    //if no error -> valid
}


// Create a new user given a profile
UserSchema.statics.findOrCreateOAuthUser = function(profile, callback){
    var User = this;

    // Build dynamic key query
    var query = {};
    query[profile.authOrigin + '.id'] = profile.id;

    // Search for a profile from the given auth origin
    User.findOne(query, function(err, user){
        if(err) throw err;

        // If a user is returned, load the given user
        if(user){
            callback(null, user);
        } else {
            // Otherwise, store user, or update information for same e-mail
            User.findOne({ 'email' : profile.emails[0].value }, function(err, user){
                if(err) throw err;

                if(user){
                    // Preexistent e-mail, update
                    user[''+profile.authOrigin] = {};
                    user[''+profile.authOrigin].id = profile.id;
                    user[''+profile.authOrigin].email = profile.emails[0].value;
                    user[''+profile.authOrigin].name = profile.displayName;

                    user.save(function(err, user){
                        if(err) throw err;
                        callback(null, user);
                    });
                } else {
                    // New e-mail, create
                    
                    // Fixed fields
                    user = {
                        email : profile.emails[0].value,
                        firstName : profile.displayName.split(" ")[0],
                        lastName : profile.displayName.replace(profile.displayName.split(" ")[0] + " ", "")
                    };

                    // Dynamic fields
                    user[''+profile.authOrigin] = {};
                    user[''+profile.authOrigin].id = profile.id;
                    user[''+profile.authOrigin].email = profile.emails[0].value;
                    user[''+profile.authOrigin].name = profile.displayName;

                    User.create(
                        user,
                        function(err, user){
                            if(err) throw err;
                            callback(null, user);
                        }
                    );
                }
            });
        }
    });
}


var User = mongoose.model('User', UserSchema);
module.exports = User;

