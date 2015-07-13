angular.module('app.routes', ['ngRoute'])


.config(function($routeProvider, $locationProvider){

	$routeProvider

	// Route for booking edit page
	.when("/booker", {
		templateUrl: 'app/views/pages/booker.html',
		controller: 'bookingEditController',
		controllerAs: 'editor'
	})

	// Route for home/day selector page
	.when("/", {
		templateUrl: 'app/views/pages/dayselector.html',
		controller: 'daySelectorController',
		controllerAs: 'selector'
	})

    // Route for profile page
	.when("/profile", {
		templateUrl: 'app/views/pages/profile.html',
		controller: 'profileController',
		controllerAs: 'profile'
	})

	// Route for timeslot/equipment selection
	.when("/schedule", {
		templateUrl: 'app/views/pages/schedule.html',
		controller: 'scheduleController',
		controllerAs: 'schedule'
	})

	//Page for login screen
  	.when("/login", {
		templateUrl: 'app/views/pages/login.html',
		controller: 'loginController',
		controllerAs: 'login'
	})

    //error page for scheduling conflicts
	.when("/error", {
		templateUrl: 'app/views/pages/error.html',
	})
	

	// Added to remove the # from URLs
	$locationProvider.html5Mode(true);
});
