angular.module('app.routes', ['ngRoute'])

//added by JJ
.config(function($routeProvider, $locationProvider){

	$routeProvider

	// Route for home page
	.when("/", {
		templateUrl: 'app/views/pages/booker.html',
		controller: 'bookingCreatorController',
		controllerAs: 'booker'
	});

	// Added to remove the # from URLs
	$locationProvider.html5Mode(true);
})

.config(function($routeProvider, $locationProvider){

	$routeProvider

	// Route for home page
	.when("/users", {
		templateUrl: 'app/views/pages/users/all.html',
		controller: 'userController',
		controllerAs: 'user'
	});

	// Added to remove the # from URLs
	$locationProvider.html5Mode(true);
})


.config(function($routeProvider, $locationProvider){

	$routeProvider

	// Route for user create page
	.when("/users/create", {
		templateUrl: 'app/views/pages/users/single.html',
		controller: 'userCreateController',
		controllerAs: 'user'
	})


    // page to edit a user
    .when("/users/:user_id", {
        templateUrl: 'app/views/pages/users/single.html',
        controller: 'userEditController',
        controllerAs: 'user'
    })

	// Added to remove the # from URLs
	$locationProvider.html5Mode(true);
});
