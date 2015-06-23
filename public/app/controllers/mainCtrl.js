angular.module('mainCtrl', [])

.controller('mainController', function($rootScope, $location, Auth) {

    var vm = this;


    vm.message = 'Welcome to the User CRM!'

    // get info if a person is logged in
    vm.loggedIn = Auth.isLoggedIn();

    // check to see if a user is logged in on every request
    $rootScope.$on('$routeChangeStart', function() {
        vm.loggedIn = Auth.isLoggedIn();
        
        //get user information on route change
        Auth.getUser().success(function(data) {
                vm.user = data;
         });

    });


    // function to handle login form
    vm.doLogin = function() {
        
        vm.processing = true;
        vm.error = '';

        // call the Auth.login() function
        Auth.login(vm.username, vm.password).success(function(data) {
                vm.processing = false;
      
                if (data.success)
                    $location.path('/users');
                else
                    vm.error = data.message;

            });

       
    };

    // function to handle logging out
    vm.doLogout = function() {
        Auth.logout();

        // reset all user info
        vm.user = {};
        $location.path('/login');
    };
});
