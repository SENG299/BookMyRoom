angular.module('profileCtrl', ['authService', 'bookingService', 'userService'])

  .controller('profileController', function($rootScope, $location, Auth, Booking, $cookies) {
    var vm = this


    vm.loggedIn = Auth.isLoggedIn();
    vm.now = new Date()
    vm.nowYear = vm.now.getFullYear()
    vm.nowMonth = vm.now.getMonth()
    vm.nowDay =vm.now.getDate()

    vm.userFutureBookings = new Array()
 

    //Valiadates the login+token and retrives the username from token
    if (vm.loggedIn) {
      Auth.getUser().success(function(data) {

        vm.username = data.username;

        console.log("in prfile controller", data)

        Booking.getUserBookings("bunny").success(function (bookingData) {
          vm.userBookingData = bookingData

            
            
    
            console.log("booking data for bunny " + bookingData);
          

          vm.totalBookings = Object.keys(bookingData).length

          var i;
          for ( i = 0; i< vm.totalBookings; i++) {
           
              vm.startTime = new Date(vm.userBookingData[i].start_year, vm.userBookingData[i].start_month, vm.userBookingData[i].start_day, vm.userBookingData[i].start_hour, vm.userBookingData[i].start_minute)


              vm.endTime = new Date (vm.userBookingData[i].start_year, vm.userBookingData[i].start_month, vm.userBookingData[i].start_day, vm.userBookingData[i].end_hour, vm.userBookingData[i].end_minute )

              
              vm.userFutureBookings.push({startTime:vm.startTime, endTime:vm.endTime, data:vm.userBookingData[i]})
            console.log(vm.userBookingData[i]);
              
            
          }
            
        
        })



        console.log(vm.userFutureBookings)
      });
        
    } else {
      console.log("User is not logged in! ")
    }


    
    
    vm.setSelected = function (booking) {

        console.log("setSelectBooking cookie");

        $cookies.putObject('selectedBooking', booking)
        console.log(booking);

        $location.path("/booker")

    }



     

// "start_minute": 0,
//     "start_hour": 8,
//     "start_day": 3,
//     "start_month": 7,
//     "start_year": 2015,




  });
