var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var HomeSchema = new Schema({
	user_id: Number
});

module.exports = mongoose.model('Home', HomeSchema);
