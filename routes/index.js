var express = require('express');
var passport = require('passport');
//
var auth = require('../middlewares/auth.js');
var User = require('../models/users');
var Tweet = require('../models/tweets');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        var curUserId = req._passport.session.user;
        User.findOne({_id: curUserId}, function(err, curUser) {
            if (err) throw err;
            //following tweets + my feeds to feed
            curUser.followings.push(curUserId);
            Tweet.find({_user : {$in: curUser.followings}}).sort({createdAt: -1}).limit(10).populate('_user').exec(function(err, tweets) {
                if (err) throw err;
                return res.render('index', { title: 'Twitter Clone', user: req.user, tweets: tweets });
            });
        });
        //All tweets
        // Tweet.find({}).sort({createdAt: -1}).limit(10).populate('_user').exec(function(err, tweets) {
        //     if (err) throw err;
        //     return res.render('index', { title: 'Twitter Clone', user: req.user, tweets: tweets });
        // });
    }
    else {
        return res.render('index', { title: 'Twitter Clone', user: null, tweets: [] });
    }
});


router.get('/signup', function(req, res) {
    res.render('signup', { title: 'Registration'});
});

router.post('/signup', function(req, res, callback) {
    //if (auth.userExist(req, res, callback) !== 0) {
    var users = User.find({ email: req.body.email}, function(err, c) { //check if exists
        if (c.length) {
            //console.log(c);
            return res.render('signup', { errorMsg: 'User with this email already exists'});
            //return res.redirect('/signup');
        }
        else {
            if (req.body.password !== req.body.reppassword) {
                return res.render('signup', { errorMsg: 'Confirmed password is wrong'});
            }

            User.signup(req.body.email, req.body.password, req.body.name, function(err, user){ //if doesnt exist -> create user
                if(err) throw err;
                req.login(user, function(err){
                    if(err) return callback(err);
                    res.redirect("feeds/" + req.user.id);
                    //return res.render("feeds", {user : req.user});
                });
            });
        }
    });
    //if (req.body.password !== req.body.reppassword)
        //return callback(err);
    //res.render('test', {name: req.body.name, email: req.body.email, password: req.body.password, reppassword: req.body.reppassword});
    
});

router.post('/signin', passport.authenticate('local', {
        failureRedirect: '/', //redirect to user tweets
    }),
    function(req,res){
        //es.render("feeds/" + req.user.id, {user : req.user});
        res.redirect("feeds/" + req.user.id);
    }
);

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get("/auth/facebook", passport.authenticate("facebook", { scope : "email"}));
router.get("/auth/facebook/callback", 
    passport.authenticate("facebook", { failureRedirect: '/'}),
    function(req,res){
        res.render("feeds", {user : req.user});
    }
);

module.exports = router;
