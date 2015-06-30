var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var BookingSchema = new Schema({
	booking_id: { type: String, required: true, index: { unique: true }},
	netlink_id: String,
	room_id: Number,
	projector_id: Number,
	laptop_id: Number,
	start_year: Number,
	start_month: Number,
	start_day: Number,
	start_hour: Number,
	start_minute: Number,
	end_hour: Number,
	end_minute: Number
});

module.exports = mongoose.model('Booking', BookingSchema);
