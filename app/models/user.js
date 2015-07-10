var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt 	 = require('bcrypt-nodejs');

// user schema 
var UserSchema = new Schema({
	netlink_id: { type: String, required: true, index: { unique: true }}, 
	name: String,
	last_name: String,
	user_type: Number, 
	username: { type: String, required: true, index: { unique: true }}, //this is not needed in the real app, this is still here so that it doesn't break the code.
	password: { type: String, required: true, select: false },
	email: String,
	phone: String,
	lockout: String,
});


// hash the password before the user is saved
UserSchema.pre('save', function(next) {
	var user = this;

	// hash the password only if the password has been changed or user is new
	if (!user.isModified('password')) return next();

	// generate the hash
	bcrypt.hash(user.password, null, null, function(err, hash) {
		if (err) return next(err);

		// change the password to the hashed version
		user.password = hash;
		next();
	});
});

// method to compare a given password with the database hash
UserSchema.methods.comparePassword = function(password) {
	var user = this;

	return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
