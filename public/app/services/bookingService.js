angular.module('bookingService', [])

.factory('Booking', function($http) {

	// create a new object
	var bookingFactory = {};

	// get all bookings
	bookingFactory.getAllBookings = function() {
		return $http.get('/api/allbookings/');
	};

	bookingFactory.getBookings = function(year, month, day){
		console.log(year + " " + month + " " + day);
		return $http.post('/api/bookings/', {year: year, month: month, day: day});
	};
	
	// create a single booking
	bookingFactory.create = function(bookingData) {
		return $http.post('/api/bookings/create/', bookingData);
	};

	// return our entire bookingFactory object
	return bookingFactory;
});
