var User = require('../models/users');

exports.isAuthenticated = function (req, res, next){
    if(req.isAuthenticated()){
        next();
    } else{
        res.redirect("/");
    }
}

exports.userExist = function(req, res, next) {
    return User.count({ email: req.body.email});
}

/*exports.userExist = function(req, res, next) {
    User.count({
        email: req.body.email
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            res.redirect("/signup");
        }
    });
}*/