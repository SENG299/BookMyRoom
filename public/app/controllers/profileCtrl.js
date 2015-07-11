angular.module('profileCtrl', ['authService', 'bookingService', 'userService'])

  .controller('profileController', function($rootScope, $location, Auth, Booking, $cookies, User, AuthToken) {
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

        vm.username = data.username
        vm.last_name = data.last_name
        vm.email = data.email
        vm.user_type = data.user_type
        vm.userType 
        vm.phone = data.phone
        vm.netlink_id = data.netlinkId
        vm.name = data.name

        vm.new_email =  vm.email
        vm.new_phone =  vm.phone

        switch (data.user_type) {
          case 0: vm.userType = "Admin"
            break

          case 1: vm.userType = "Faculty"
            break

          case 2: vm.userType = "Staff"
            break
            
          case 3: vm.userType = "Student"
            break
        }

        if (vm.userType === "Admin") {
          Booking.getAllBookings()
            .success(function (bookingData) {
              vm.totalBookings = Object.keys(bookingData).length
              vm.userBookingData = bookingData
              vm.calulateBookings()
          })
        } else {
            Booking.getUserBookings(vm.netlink_id)
              .success(function (bookingData) {
                vm.totalBookings = Object.keys(bookingData).length
                vm.userBookingData = bookingData
                vm.calulateBookings()
            })
        }

        vm.calulateBookings = function() {
          var i;
          for ( i = 0; i< vm.totalBookings; i++) {
            if (vm.nowYear <= vm.userBookingData[i].start_year &&
              vm.nowMonth <= (vm.userBookingData[i].start_month) &&
              vm.nowDay <= vm.userBookingData[i].start_day) {

              vm.startTime = new Date(vm.userBookingData[i].start_year, vm.userBookingData[i].start_month, vm.userBookingData[i].start_day, vm.userBookingData[i].start_hour, vm.userBookingData[i].start_minute)
              vm.endTime = new Date (vm.userBookingData[i].start_year, vm.userBookingData[i].start_month, vm.userBookingData[i].start_day, vm.userBookingData[i].end_hour, vm.userBookingData[i].end_minute )
              vm.hasLaptop = (Number(vm.userBookingData[i].laptop_id) === -1)? "No" : "Yes"
              vm.hasProjector = (Number(vm.userBookingData[i].projector_id) === -1)? "No" : "Yes"
              vm.roomId = vm.userBookingData[i].room_id
              vm.userFutureBookings.push({startTime:vm.startTime, endTime:vm.endTime, data:vm.userBookingData[i], hasLaptop:vm.hasLaptop, hasProjector: vm.hasProjector, roomId: vm.roomId})
            }
          }
        }
      })
    } else {
      alert("Please log in!")
      $location.path( "/login" )
    }
    
    vm.setSelected = function (booking) {
      $cookies.putObject('selectedBooking', booking)
      console.log(booking);
      $location.path("/booker")
    }

    vm.updateUserInfo = function() {

      if(vm.new_email != vm.email || vm.new_phone != vm.phone) {
        User.updateInfo(vm.netlink_id, vm.new_email, vm.new_phone)
          .success(function(data) {
            AuthToken.setToken(data.token)
            location.reload()
          })
      }
    }
  })
