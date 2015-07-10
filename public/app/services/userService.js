angular.module('userService', [])

.factory('User', function($http) {

	// create a new object
	var userFactory = {};

	// get a single user
	userFactory.get = function(id) {
		// since this call requires a user ID we'll add the id to
		// the end of the URL
		return $http.get('/api/users/' + id);
	};

	// get all users
	userFactory.all = function() {
		return $http.get('/api/users/');
	};

	userFactory.create = function(userData){
		// since this is a post method we need to include userData
		// from our form
		return $http.post('/api/users', userData)	
	};

	// update a user (By direct API calls)
	userFactory.update = function(id, userData) {
		return $http.put('/api/users/' + id, userData);
	};

	// update a user (From profile)
	userFactory.updateInfo = function(netlink_id, newEmail, newPhone) {
		var newInfo = { email: newEmail, phone: newPhone }
		return $http.put('/api/users/update/' + netlink_id, newInfo);
	};

	// delete a user
	userFactory.delete = function(id) {
		return $http.delete('/api/users/' + id);
	};

	//locks a user out
	userFactory.lockout = function(netlink_id, lockout) {
		return $http.put('/api/users/lockout/'+ netlink_id, lockout);
	};
	
	return userFactory;
});
