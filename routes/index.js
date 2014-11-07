var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var user = null;
    if (req.isAuthenticated()) {
        user = req.user;
    }

    res.render('index', { title: 'Twitter Clone', user: user });
});

router.get('/signup', function(req, res) {
    res.render('signup', { title: 'Registration'});
});

router.post('/signin', passport.authenticate('local', {
    successRedirect : "/myfeed", //redirect to user wall
    failureRedirect : "/",
}));

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get("/auth/facebook", passport.authenticate("facebook", { scope : "email"}));
router.get("/auth/facebook/callback", 
    passport.authenticate("facebook", { failureRedirect: '/'}),
    function(req,res){
        res.render("myfeed", {user : req.user});
    }
);

module.exports = router;
