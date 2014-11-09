var mongoose = require('mongoose');
var hash = require('../utils/hash');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: String,
    name: String,
    salt: String,
    hash: String,
    tweets: [{
       type: Schema.Types.ObjectId,
       ref: 'Tweet'
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    followings: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});


UserSchema.statics.signup = function(email, password, name, callback) {
    var User = this;

    hash(password, function(err, salt, hash) {
        if(err) throw err;

        User.create({
            email: email,
            salt: salt,
            name: name,
            hash: hash
        }, function(err, user) {
            if (err) throw err;
            callback(null, user);
        })
    });
};

UserSchema.statics.isFollowMe = function(meId, followerId, callback, altcallback) {
    if (!meId || !followerId || meId == followerId) {
        altcallback(null);
    }
        
    User.findOne({_id: meId}, function(err, curUserObj){
        if (err) throw err;

        var index = curUserObj.followings.indexOf(followerId);
        if (index > -1) {
            callback();
        }
        else {
            altcallback(null);
        }
    }); 
};


UserSchema.statics.follow = function(meId, followerId, callback) {
    if (!meId || !followerId || meId == followerId) 
        callback(null, followerId);
    User.findOne({_id: meId}, function(err, curUser) {
        if (err) throw err;

        User.findOne({_id: followerId}, function(err, followUser) {
            if (err) throw err;

            curUser.followings.push(followUser._id);

            followUser.followers.push(curUser._id);

            curUser.save(function(err){
                if (err) throw err;

                followUser.save(function(err) {
                    if (err) throw err;
                    callback(null, followerId);
                    //return res.redirect('' + followUserId); 
                });
            });
        });
    });
};

UserSchema.statics.unfollow = function(meId, followerId, callback) {
    if (!meId || !followerId || meId == followerId) 
        callback(null, followerId);
    User.findOne({_id: meId}, function(err, curUser){
        if (err) throw err;

        User.findOne({_id: followerId}, function(err, followUser){
            if (err) throw err;

            //curUser.find({followings: mongoose.Types.ObjectId(followerId)});
            //followUser.find({followers: mongoose.Types.ObjectId(meId)});
            //curUser.followings.id(followerId).remove(); //doesnt work for array, probably need to populate
            //followUser.followers.id(meId).remove();

            var index = curUser.followings.indexOf(followerId);
            if (index > -1) curUser.followings.splice(index, 1);

            var index = followUser.followers.indexOf(meId);
            if (index > -1) followUser.followers.splice(index, 1); //splice == remove. I dont like it due to full memory realloc 

            curUser.save(function(err){
                if (err) throw err;
                followUser.save(function(err) {
                    if (err) throw err;
                    callback(null);
                });
            });
        }); 
    });
};

UserSchema.statics.isValidCredentials = function(email, password, callback) { //Check user credentials
    this.findOne({email: email}, function(err, user) { //1. find user
        if (err) callback(err);
        if (!user) {
            callback(null, false, { message: 'Incorrect mail'});
            return;
        }
        hash(password, user.salt, function(err, hash) { //check password hashes
            if (err) callback(err);
            console.log(hash, user.hash);
            if (hash == user.hash) return callback(null, user);
            //console.log('Incorrect password')
            callback(null, false, { message: 'Incorrect password'});
        });
    });
    //if no error -> valid
};

var User = mongoose.model('User', UserSchema);
module.exports = User;

