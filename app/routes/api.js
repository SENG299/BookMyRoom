var bodyParser = require('body-parser'); 	// get body-parser
var User       = require('../models/user');
var Booking = require('../models/booking');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

	var apiRouter = express.Router();

    /*
	// test route to make sure everything is working 
	// accessed at GET http://localhost:8080/api
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'Welcome to the User API for Lab 7' });	
	});
    */

    //authentication route
    apiRouter.post('/authenticate', function(req, res) {
        
        //console.log(req.body.username);

        // find the user
        // select the name username and password explicitly
        User.findOne({
            username: req.body.username
        }).select('name username password').exec(function  (err, user) {

            if (err) throw err;

            // no user with that username was found
            if (!user) {
                res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'

                });

            } else if (user) {
            
                // check if password matches
                var validPassword = user.comparePassword(req.body.password);
                
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {

                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({
                        name: user.name,
                        username: user.username
                    }, superSecret, {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }
            }
        });
    });

    // route middleware to verify a token
    apiRouter.use(function(req, res, next) {
    
        // do logging
        console.log('Somebody just came to our app!');

        // check header or url parameters or post parameters for token
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];



//IMPORTAN THE TOKEN PART IS DEACTIVATED FOR TESTING. THIS SHOULD BE REINCORPORATED LATER
/*
        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, superSecret, function(err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });

                } else {
                
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next(); // make sure we go to the next routes and don't stop here
                }
            });

        } else {

        // if there is no token
        // return an HTTP response of 403 (access forbidden) and an error message
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }

*/
next(); //FOR DEBUGGING ONLY TODO: remove this line
    });
    

	// on routes that end in /users
	// ----------------------------------------------------
	apiRouter.route('/users')

		// create a user (accessed at POST http://localhost:8080/users)
		.post(function(req, res) {
			
			var user = new User();		// create a new instance of the User model
			user.name = req.body.name;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)

			user.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else 
						return res.send(err);
				}

				// return a message
				res.json({ message: 'User created!' });
			});

		})

		// get all the users (accessed at GET http://localhost:8080/api/users)
		.get(function(req, res) {

			User.find({}, function(err, users) {
				if (err) res.send(err);

				// return the users
				res.json(users);
			});
		});





//added by JJ 
// on routes that end in /bookings/day
// returns all the boookings in a specific day
// ----------------------------------------------------
	apiRouter.route('/bookings/:year/:month/:day')

		.get(function(req, res) {
			var year = req.params.year;
			var month = req.params.month;
			var day = req.params.day;
			Booking.find({"start_year":year, "start_month": month, "start_day": day}, function(err, bookings) {
				if (err) res.send(err);

				// return the bookings
				res.json(bookings);
			});
		});

// on routes that end in /bookings/day
// returns all the boookings in a specific day
// ----------------------------------------------------
	apiRouter.route('/allbookings')
		
		// create a user (accessed at POST http://localhost:8080/users)
		.get(function(req, res) {

			Booking.find({}, function(err, bookings) {
				if (err) res.send(err);

				// return the bookings
				res.json(bookings);
			});
		});

// on routes that end in /bookings/create
// creates a new booking
// ----------------------------------------------------

apiRouter.route('/bookings/create')
		
		// create a user (accessed at POST http://localhost:8080/users)
		.post(function(req, res) {
			
			var booking = new Booking();		// create a new instance of the Booking model
			booking.booking_id = req.body.booking_id; //sets the booking id in the booking model from the request
			booking.netlink_id = req.body.netlink_id; //sets netlink id in the booking model from the request
			booking.room_id = req.body.room_id;  //sets room id in the booking model from the request
			booking.projector_id = req.body.projector_id;  //sets projector id in the booking model from the request
			booking.laptop_id = req.body.laptop_id;  //sets laptop id in the booking model from the request
			booking.start_year = req.body.start_year; //sets start_year in the booking model from the request
			booking.start_month = req.body.start_month;
			booking.start_day = req.body.start_day;
			booking.start_hour = req.body.start_hour;
			booking.start_minute = req.body.start_minute;
			booking.end_hour = req.body.end_hour; //sets end_hour in the booking model from the request	
			booking.end_minute = req.body.end_minute;
			booking.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A booking with that id already exists. '});
					else 
						return res.send(err);
				}

				// return a message
				res.json({ message: 'Booking created!' });
			});

		});


// on routes that end in /bookings/user
// returns all the boookings in a specific day
// ----------------------------------------------------

	apiRouter.route('/bookings/:netlink_id')
		
		.get(function(req, res) {

			Booking.find({"netlink_id":req.params.netlink_id}, function(err, bookings) {
			if (err) res.send(err);

				// return the bookings belonging to the user with the netlink_id
				res.json(bookings);
			});
		});

// on routes that end in /bookings/delete/:/booking_id
// deletes a specific booking
// ----------------------------------------------------
apiRouter.route('/bookings/delete/:booking_id')
		// delete the booking with this id
		.delete(function(req, res) {
			Booking.remove({
				_id: req.params.booking_id
			}, function(err, booking) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});





	// on routes that end in /users/:user_id
	// ----------------------------------------------------
	apiRouter.route('/users/:user_id')

		// get the user with that id
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);

				// return that user
				res.json(user);
			});
		})

		// update the user with this id
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {

				if (err) res.send(err);

				// set the new user information if it exists in the request
				if (req.body.name) user.name = req.body.name;
				if (req.body.username) user.username = req.body.username;
				if (req.body.password) user.password = req.body.password;

				// save the user
				user.save(function(err) {
					if (err) res.send(err);

					// return a message
					res.json({ message: 'User updated!' });
				});

			});
		})

		// delete the user with this id
		.delete(function(req, res) {
			User.remove({
				_id: req.params.user_id
			}, function(err, user) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});

	// api endpoint to get user information
	apiRouter.get('/me', function(req, res) {
		res.send(req.decoded);
	});

	return apiRouter;
};
