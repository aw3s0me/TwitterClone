var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var jade = require('jade');
var User = require('../models/users');
var Tweet = require('../models/tweets');
var router = express.Router();

router.get('/:userId', function(req, res) {
    var curUserId = req._passport.session.user;

    User.findOne({ _id: curUserId}, function(err, curUser) {
        if (err) throw err;
        User.findOne({ _id: req.params.userId}, function(err, user) {
            if (err) { //critical error
                throw err;
            }
            Tweet.find({_user: user._id}).sort({createdAt: 1}).exec(function(err, tweets){
                var msgToSend = { title: 'My Tweets', user: curUser, tweets: tweets, isFollowed: false};
                
                var paramId = req.params.userId; //parameter

                //check if tweet empty or too long
                if (req.query.err === 'empty') msgToSend.err = 'Tweet is empty';
                else if (req.query.err === 'toolong') msgToSend.err = 'Tweet is too long (no more than 148 symbols)';

                //check if it is my feed
                if (curUserId === paramId) {
                    msgToSend.isMyWall = true;//if authenticated 
                    msgToSend.seeuser = curUser; //wanna see his tweets. 
                    return res.render('feeds', msgToSend);  
                }
                else {
                    msgToSend.seeuser = user; //wanna see his tweets
                    //otherwise check if it is my follower
                    User.isFollowMe(curUserId, paramId, function() { //do if is follower
                        msgToSend.isFollowed = true;
                        return res.render('feeds', msgToSend);  
                    },
                    function() {
                        return res.render('feeds', msgToSend);  
                    });
                }
            });       
        });
    });
    
});
//no idea why but being without :id, gives me cast error
router.get('/getLast/:id', function(req, res) {
    var id = req.params.id;
    var curUserId = req._passport.session.user;
    //if user tries to fool, check if id and curUserId are equal
    if (req.isAuthenticated() && curUserId && id && (id === curUserId)) {  
        User.findOne({_id: curUserId}, function(err, curUser) {
            if (err) throw err;
            //following tweets + my tweets to feed
            curUser.followings.push(curUserId);
            Tweet.find({_user : {$in: curUser.followings}}).sort({createdAt: -1}).limit(10).populate('_user').exec(function(err, tweets) {
                if (err) throw err;
                var tweetObj = { tweets: tweets };
                var html = jade.renderFile('./views/tweet.jade', tweetObj); //render with template
                return res.send(html); //return to server
            });
        });
    }
    else {
        return res.send('');
    }
});


router.post('/add', function(req, res) {
    var text = req.body.content;
    var curUser = req._passport.session.user;
    var curDate = new Date;

    if (!text || text.length === 0) { //error handling
        return res.redirect(curUser + '?err=empty');
    }
    else if (text.length >= 148) {
        return res.redirect(curUser + '?err=toolong');
    }

    
    var newTweet = new Tweet({
        content: text,
        _user: curUser,
        createdAt: curDate,
        prettyCreatedAt: moment(curDate).format("ddd, MMM Do YY, h:mm:ss a")
    });

    newTweet.save(function(err) {
        if (err) throw err; //critical error
        User.findOne( {_id: curUser} ).exec(function(err, user) {
            if (err) throw err;
            user.tweets.push(newTweet);
            user.save(function(err) {
                if (err) throw err;
                res.redirect('' + curUser); 
            })
        });
    });
});

router.post('/follow', function(req, res) {
    var curUserId = req._passport.session.user;
    var followUserId = req.body.userId;
    console.log(curUserId, followUserId);
    User.follow(curUserId, followUserId, function(err, followUserId) {
        return res.redirect('' + followUserId);
    });
});

router.post('/unfollow', function(req, res) {
    var curUserId = req._passport.session.user;
    var followUserId = req.body.userId;
    User.unfollow(curUserId, followUserId, function(){
        return res.redirect('' + followUserId); 
    });

});


module.exports = router;