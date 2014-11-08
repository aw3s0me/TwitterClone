var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
    _user: { type: Schema.Types.ObjectId, ref: 'User'},
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    prettyCreatedAt: {
        type: String
    }
});


var Tweet = mongoose.model('Tweet', TweetSchema);
module.exports = Tweet;