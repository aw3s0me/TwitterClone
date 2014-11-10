var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/users');
var router = express.Router();



/* GET users listing. */
router.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        var userId = req._passport.session.user;
        User.find({_id: userId}, function(err, curUser){
            if (err) throw err;
            User.find({}, function(err, users) {
                if (err) throw err;
                curUser._id = userId;
                return res.render('users', {users: users, user: curUser});
            });
        })
        
    }
    else {
        return res.redirect('/');
    }
});


module.exports = router;
