var bodyParser = require('body-parser'); 	// get body-parser
var User       = require('../models/user');
var Booking = require('../models/booking');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

	var apiRouter = express.Router();

//################### Authentication ##############################
/*
  authentication route (accessed at POST http://localhost:8080/api/authenticate)
  Finds user from db using username, checks for authenticate password
  If everything is fine, it will return a token
  Then Middleware will verify the token
  So make ANY api calls, you need a token.
*/

  apiRouter.post('/authenticate', function(req, res) {

    // find the user
    // select the name username and password explicitly
    User.findOne({
      username: req.body.username
    }).select('name username password netlink_id email last_name user_type phone lockout').exec(function  (err, user) {

      if (err) throw err;

      // no user with that username was found
      if (!user) {
        res.json({
          success: false,
          message: 'Authentication failed. User not found.'
        })
      } else if (user) {
        
        // check if password matches
        var validPassword = user.comparePassword(req.body.password);
          
        if (!validPassword) {
          res.json({
            success: false,
            message: 'Authentication failed. Wrong password.'
          })
        } else {

          // if user is found and password is right
          // create a token
          var token = jwt.sign({
            name: user.name,
            username: user.username,
            netlinkId: user.netlink_id,
            email: user.email,
            last_name: user.last_name,
            user_type: user.user_type,
            phone: user.phone,
            lockout: user.lockout
          }, superSecret, {
              expiresInMinutes: 1440 // expires in 24 hours TODO: Change the token expiry timing
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

//######################## MIDDLEWARE AUTHENTICATING TOKEN #############################
  apiRouter.use(function(req, res, next) {

  console.log('Somebody just came to our app!');

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, superSecret, function(err, decoded) {
        if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          
          // if everything is good, save to request for use in other routes
          req.decoded = jwt.decode(token)

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
  });
    

/*
################################ USER ROUTES ###########################################
################################ Routes with localhost://users/* #############################
*/
	apiRouter.route('/users')

		// create a user (accessed at POST http://localhost:8080/api/users)
		.post(function(req, res) {
			
			var user = new User();		// create a new instance of the User model
			user.name = req.body.name;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)
      user.netlink_id = req.body.netlink;
      user.last_name = req.body.last_name;
      user.email = req.body.email;
      user.phone = req.body.phone;
      user.user_type = req.body.user_type;
      user.lockout = req.body.lockout;

      console.log("details: ", req.body.username, req.body.password, req.body.netlink )

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


//########################################## Routes with localhost://users/:user id  
  apiRouter.route('/users/:user_id')
    //(accessed at GET http://localhost:8080/api/users/:userid)
    // get the user with that id
    .get(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) res.send(err);

        // return that user
        res.json(user);
      });
    })

    // update the user with this id
    //(accessed at PUT http://localhost:8080/api/users/:userid)
    .put(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {

        if (err) res.send(err);

        // set the new user information if it exists in the request
        if (req.body.name) user.name = req.body.name;
        if (req.body.username) user.username = req.body.username;
        // if (req.body.password) user.password = req.body.password;
        if (req.body.email) user.email = req.body.email
        if (req.body.phone) user.phone = req.body.phone

        // save the user
        user.save(function(err) {
          if (err) res.send(err);

          // return a message
          res.json({ message: 'User updated!' });
        });

      });
    })

    ////(accessed at DELETE http://localhost:8080/api/users/:userid)
    // delete the user with this id
    .delete(function(req, res) {
      User.remove({
        _id: req.params.user_id
      }, function(err, user) {
        if (err) res.send(err);

        res.json({ message: 'Successfully deleted' });
      });
    });


//############################ Routes with http://localhost:8080/api/users/lockout
 // update the user's lockout status
 //(accessed at PUT http://localhost:8080/api/users/lockout)
 apiRouter.route('/users/lockout/:netlink_id')
    .put(function(req, res) {

      User.findOne({ netlink_id: req.params.netlink_id}, function (err, user){
        if (err) res.send(err)

           console.log("Passed in data is", req.body)
        if (req.body.lockout) user.lockout = req.body.lockout

        user.save(function(err) {
          if (err) res.send(err)

          var token = jwt.sign({
            name: user.name,
            username: user.username,
            netlinkId: user.netlink_id,
            email: user.email,
            last_name: user.last_name,
            user_type: user.user_type,
            phone: user.phone,
            lockout: user.lockout
          }, superSecret, {
              expiresInMinutes: 1440 // expires in 24 hours TODO: Change the token expiry timing
          });
          
          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });

          console.log(jwt.decode(token))
        })
      })
    })

//##################### Finding by netlink_id ############
 apiRouter.route('/users/update/:netlink_id')
    .put(function(req, res) {

      User.findOne({ netlink_id: req.params.netlink_id}, function (err, user){
        if (err) res.send(err)

           console.log("Passed in data is", req.body)
        if (req.body.email) user.email = req.body.email
        if (req.body.phone) user.phone = req.body.phone

        // user.visits.$inc();
        // user.save()

        user.save(function(err) {
          if (err) res.send(err)

          var token = jwt.sign({
            name: user.name,
            username: user.username,
            netlinkId: user.netlink_id,
            email: user.email,
            last_name: user.last_name,
            user_type: user.user_type,
            phone: user.phone,
            lockout: user.lockout
          }, superSecret, {
              expiresInMinutes: 1440 // expires in 24 hours TODO: Change the token expiry timing
          });
          
          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });

          console.log(jwt.decode(token))
        })

      })

    })



//############################ Routes with http://localhost:8080/api/bookings/*
// on routes that end in /bookings/day
// returns all the boookings in a specific day
// ----------------------------------------------------
  apiRouter.route('/bookings')

		.post(function(req, res) {
			var year = req.body.year;
			var month = req.body.month;
			var day = req.body.day;

			Booking.find({"start_year":year, "start_month": month, "start_day": day}, function(err, bookings) {
				if (err) res.send(err);

				// return the bookings
				res.json(bookings);
			});
		});


// on routes that end in /bookings/create
// creates a new booking
	apiRouter.route('/bookings/create')
		
		// create a user (accessed at POST http://localhost:8080/api/bookings/create)
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

	apiRouter.route('/roombookings/:room_id/:year/:month/:day')
		.get(function(req, res){
			Booking.find({"room_id":req.params.room_id, "start_year":req.params.year, "start_month": req.params.month, "start_day": req.params.day}, 
			function(err, bookings) {
				if(err) res.send(err);			
				
				res.json(bookings);
			});
		});

	apiRouter.route('/laptopbookings/:laptop_id/:year/:month/:day')
		.get(function(req, res){
			Booking.find({"laptop_id":req.params.laptop_id, "start_year":req.params.year, "start_month": req.params.month, "start_day": req.params.day}, 
			function(err, bookings) {
				if(err) res.send(err);			
				
				res.json(bookings);
			});
		});
	
	apiRouter.route('/projectorbookings/:projector_id/:year/:month/:day')
		.get(function(req, res){
			Booking.find({"projector_id":req.params.projector_id, "start_year":req.params.year, "start_month": req.params.month, "start_day": req.params.day}, 
			function(err, bookings) {
				if(err) res.send(err);			
				
				res.json(bookings);
			});
		});


/*
############################ Routes with http://localhost:8080/api/bookings/:netlink_id
on routes that end in /bookings/user
returns all the boookings for a user
*/

	apiRouter.route('/bookings/:netlink_id')

		//(accessed at GET http://localhost:8080/api/bookings/:netlink_id)
		.get(function(req, res) {

			Booking.find({"netlink_id":req.params.netlink_id}, function(err, bookings) {
			if (err) res.send(err);

				// return the bookings belonging to the user with the netlink_id
				res.json(bookings);
			});
		});

// on routes that end in /api/bookings/delete/:/booking_id
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


// on routes that end in /bookings/day
// returns all the existing boookings 
// ----------------------------------------------------
  apiRouter.route('/allbookings')
    
    // create a user (accessed at POST http://localhost:8080/api/allbookings)
    .get(function(req, res) {

      Booking.find({}, function(err, bookings) {
        if (err) res.send(err);

        // return the bookings
        res.json(bookings);
      });
    });


	// on routes that end in /users/:user_id
	// ----------------------------------------------------
	

	// api endpoint to get user information
	apiRouter.route('/me')
    .get(function(req, res) {

      // var decodedT = jwt.decode(token)
      //     console.log("DEcodedetoken in middleware:", decodedT)

      res.send(req.decoded);
	});


	return apiRouter;
};
