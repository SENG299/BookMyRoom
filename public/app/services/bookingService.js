angular.module('bookingService', [])

.factory('Booking', function($http) {

	// create a new object
	var bookingFactory = {};

	// get all bookings
	bookingFactory.getAllBookings = function() {
		return $http.get('/api/allbookings/');
	};

	bookingFactory.getBookings = function(year, month, day){
    
		return $http.post('/api/bookings/', {year: year, month: month, day: day});
	};
	
	// create a single booking
	bookingFactory.create = function(bookingData) {
		return $http.post('/api/bookings/create/', bookingData);
	};

    	// delete a single booking
	bookingFactory.delete = function(bookingId) {
		return $http.delete('/api/bookings/delete/' + bookingId);
 
	};

	//Get user's bookings
	bookingFactory.getUserBookings = function(netlink_id) {
		return $http.get('/api/bookings/' + netlink_id);
	};


	//Get all bookings for one room on one day
	bookingFactory.getRoomBookings = function(roomid, year, month, day){
		return $http.get('/api/roombookings/'+roomid+'/'+year+'/'+month+'/'+day);	
	};

	//Get all bookings for one laptop on one day
	bookingFactory.getLaptopBookings = function(laptopid, year, month, day){
		return $http.get('/api/laptopbookings/'+laptopid+'/'+year+'/'+month+'/'+day);	
	};
	
	//Get all bookings for one projector on one day
	bookingFactory.getProjectorBookings = function(projectorid, year, month, day){
		return $http.get('/api/projectorbookings/'+projectorid+'/'+year+'/'+month+'/'+day);	
	};

	// return our entire bookingFactory object
	return bookingFactory;
});
