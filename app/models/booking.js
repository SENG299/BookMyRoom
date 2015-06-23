var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var BookingSchema = new Schema({
	booking_id: { type: String, required: true, index: { unique: true }},
	netlink_id: String,
	room_id: String,
	projector_id: String,
	laptop_id: String,
	start_time: Date,
	end_time: Date
});

module.exports = mongoose.model('Booking', BookingSchema);
