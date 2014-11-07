var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var entriesSchema = new Schema({
    content: String,
    title: String,
    user: {
       type: Schema.ObjectId,
       ref: 'users'
    }

});

mongoose.model('entries', entriesSchema);