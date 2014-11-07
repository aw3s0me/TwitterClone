var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    email: String
});

mongoose.model('users', usersSchema);