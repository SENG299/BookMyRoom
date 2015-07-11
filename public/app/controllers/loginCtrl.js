angular.module('loginCtrl', ['authService'])

.controller('loginController', function($rootScope, $location, Auth) {
 // function to handle login form

 var vm = this;
   // vm.loggedIn = Auth.isLoggedIn();



    // check to see if a user is logged in on every request
    $rootScope.$on('$routeChangeStart', function() {
        vm.loggedIn = Auth.isLoggedIn();

    });

    vm.doLogin = function() {
      vm.processing = true;
      vm.error = '';

      // call the Auth.login() function
      Auth.login(vm.username, vm.password).success(function(data) {
        vm.processing = false;

        if (data.success)
            $location.path('/');
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
    }
});