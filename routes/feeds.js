var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/users');
var router = express.Router();

router.get('/:userId', function(req, res) {
    var result = User.findOne({ _id: req.params.userId}, function(err, user) {
        if (err) {
            throw err;
        }
        return res.render('feeds', { title: 'My Tweets', user: user});
    });

    //res.send(req.params.userId);
});



module.exports = router;