var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var User = require('../models/users');
var Tweet = require('../models/tweets');
var router = express.Router();

router.get('/:userId', function(req, res) {
    var result = User.findOne({ _id: req.params.userId}, function(err, user) {
        if (err) { //critical error
            throw err;
        }
        var tweets = Tweet.find( {_user: user._id}).sort({createdAt: 1}).exec(function(err, tweets){
            var msgToSend = { title: 'My Tweets', user: user, tweets: tweets};
            var curUser = req._passport.session.user;
            if (req.query.err === 'empty') msgToSend.err = 'Tweet is empty';
            else if (req.query.err === 'toolong') msgToSend.err = 'Tweet is too long (no more than 148 symbols)';
            if (curUser === req.params.userId) msgToSend.isMyWall = true;//if authenticated
            return res.render('feeds', msgToSend);
        });       
    });

    //res.send(req.params.userId);
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
    //console.log(newTweet.id, 'OOOO');
    //console.log(_user, createdAt, content);

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


module.exports = router;