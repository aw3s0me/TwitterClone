var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a rdddesource');
});

router.get('/:userId', function(req, res) {
    /*mongoose.model('users').find({user: req.params.userId}, function(err, users) {
        mongoose.model('users').populate(users, {path: 'entry'}, function(err, users) {
            res.send(users);
        });
    });*/
    res.send(req.params.userId);

});




module.exports = router;
