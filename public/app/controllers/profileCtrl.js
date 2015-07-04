angular.module('profileCtrl', ['authService', 'bookingService', 'userService'])

  .controller('profileController', function($rootScope, $location, Auth, AuthToken) {
    var vm = this
    vm.user
    vm.loggedIn = Auth.isLoggedIn();

    if (vm.loggedIn) {
      Auth.getUser().success(function(data) {
        vm.username = data.username;
      });

    } else {
      console.log("User is not logged in! ")
    }

     vm.message = "profileController"
  });
