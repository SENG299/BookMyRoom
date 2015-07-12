angular.module('editCtrl', ['bookingService', 'ngCookies', 'scheduleService', 'userService', 'authService'])

.controller('bookingEditController', function($rootScope, $location, Booking, $cookies, Schedule, User, Auth) {
	var vm = this;

	vm.userData = "";
	vm.loggedIn = Auth.isLoggedIn();
	if(vm.loggedIn){
		Auth.getUser()
			.success(function(data){
				vm.userData = data;			
			});
	}


    vm.clearBookingData = function () {
        //clear the form
	vm.bookingData = {};
        
    };


    vm.proj_changed = false;
    vm.lap_changed = false;
        

    vm.editProjector = function(){
        vm.proj_changed = !vm.proj_changed;
        
    }

    vm.editLaptop = function(){
        vm.lap_changed = !vm.lap_changed;
            
    }

    vm.newBookingData = {};
    vm.newBookingData = $cookies.getObject('selectedBooking');

    vm.proj = (vm.newBookingData.data.projector_id < 0 ? false : true);
    vm.lap = (vm.newBookingData.data.laptop_id < 0 ? false : true);

    var day = new Date(vm.newBookingData.data.start_year,vm.newBookingData.data.start_month,vm.newBookingData.data.start_day).getDay();
    Schedule.setDay(day);

    /// edit booking 
    vm.setNewBookingData = function () {

        vm.bookingId = vm.newBookingData.data._id;
     
        //make a DELETE http request to backend /api/deletebooking through service
        Booking.delete(vm.bookingId)
			.success(function() {
				console.log("did it delete?");        
		    });
        
        console.log("in edit booking")

        //add extend timing limit here
      
        //create new booking

        //set new endtime for booking
        //me/motfy/Desktop/BookMyRoom/public/app/services/scheduleService.js' 
        vm.newBookingData.data.end_hour = new Date(vm.extendSelected).getHours();
	vm.newBookingData.data.end_minute = new Date(vm.extendSelected).getMinutes();

        vm.newBookingData.endTime = new Date (vm.newBookingData.endTime).setMinutes(vm.newBookingData.data.end_minute)
        vm.newBookingData.endTime = new Date (vm.newBookingData.endTime).setHours(vm.newBookingData.data.end_hour)

	Booking.getBookings(vm.newBookingData.data.start_year, vm.newBookingData.data.start_month, vm.newBookingData.data.start_day)
		.success(function(data)
		{	
        
            console.log("get bookings success")


	        //it's a weekend
	               var startSlot = Schedule.calculateSlot(vm.newBookingData.data.start_hour, vm.newBookingData.data.start_minute);
	    var endSlot = Schedule.calculateSlot(vm.newBookingData.data.end_hour, vm.newBookingData.data.end_minute); 

            console.log("---------");
            var objectArrays = Schedule.buildObjectArrays(data);

	    var projectors = objectArrays.projectors;
	    var laptops = objectArrays.laptops;

            var projectorId = vm.newBookingData.data.projector_id;
	    var laptopId = vm.newBookingData.data.laptop_id;
        
            if(vm.lap_changed){
                if(vm.lap){
                    laptopId = Schedule.findLaptop(laptops, startSlot, endSlot);
                    console.log("laptop changed to true -> " + laptopId)
                }else{
                    
                    laptopId = -1;
                    console.log("laptop changed to false -> " + laptopId)
                }

            }else{

                 if(vm.lap){
          
                    
                    console.log(" orginal laptop -> " + laptopId)
                }else{
                    laptopId = -1;
                     console.log(" original laptop -> " + laptopId)
                }
            }
		
            //console.log("im here")
            
            if(vm.proj_changed){
                if(vm.proj){
                    projectorId = Schedule.findProjector(projectors, startSlot, endSlot);
                    console.log("projector changed to true-> " + projectorId)
                }else{
                    projectorId = -1;
                    console.log("projector changed to false-> " + projectorId)
                }

            }else{

                if(vm.proj){
                    
                    console.log("orginal proj -> " + projectorId)
                }else{
                    projectorId = -1;
                    console.log("proj -> " + projectorId)
                }

        

            }

	    vm.newBookingData.data.netlink_id = "bunny"; 
	    vm.newBookingData.data.projector_id = projectorId;
	    vm.newBookingData.data.laptop_id = laptopId;
            
            console.log( "proj ->" +   vm.newBookingData.data.projector_id)	
            console.log( "laptop ->" +   vm.newBookingData.data.laptop_id)

	    vm.newBookingData.data.booking_id = vm.newBookingData.data.start_year + ":" +
					vm.newBookingData.data.start_month + ":" +
					vm.newBookingData.data.start_day + ":" +
					vm.newBookingData.data.start_hour + ":" +
					vm.newBookingData.data.start_minute + ":" + 
					vm.newBookingData.data.end_hour + ":" +
					vm.newBookingData.data.end_minute + ":" +
					vm.newBookingData.data.room_id; 
     
            Booking.create(vm.newBookingData.data)
				.success(function(data) {
					vm.processing = false; 
                    console.log("made the new booking");
			});


            $rootScope.modalinfo = vm.newBookingData;

            
            console.log("-------")
            console.log("-------")
            console.log(vm.newBookingData.data)

        }).error(function(data){
            console.log("ifuckedup");
        })
        
        console.log("data to create new booking" );
        console.log(vm.newBookingData);
        
      }   
      
     vm.addMin = function(date, minutes) {

        var d = new Date(date);
        //console.log(new Date(d.getTime()+ minutes*60000));

        return new Date(d.getTime() + minutes*60000);
     };

    
    var roomId = vm.newBookingData.data.room_id;
    var year = vm.newBookingData.data.start_year;
    var month = vm.newBookingData.data.start_month;
    var day = vm.newBookingData.data.start_day;

    var bookingEnd = Schedule.calculateSlot(vm.newBookingData.data.end_hour, vm.newBookingData.data.end_minute); 	
    var maxSlot = Schedule.numSlots; //TODO: This should be changed depending on user time.
  
    vm.extendTimes = []
    vm.extendTimes.push(vm.addMin(vm.newBookingData.endTime, 0));
    vm.extendSelected = vm.extendTimes[0];

    // Figure how long you can extend to
    Booking.getRoomBookings(roomId, year, month, day)
	.success(function(data){
		for(var i = 0; i < data.length; i++)
		{
			var booking = data[i];
			var startSlot = Schedule.calculateSlot(booking.start_hour, booking.start_minute);
			console.log(booking.start_hour, booking.start_minute, Schedule.startHour);	
			console.log("startSlot: " + startSlot + " maxSlot: " + maxSlot + " bookingEnd: " + bookingEnd);
			
			if(startSlot < maxSlot && startSlot >= bookingEnd)
			{
				maxSlot = startSlot;
			}
		}

		console.log("maxslot: " + maxSlot);
	 
		var i
		for(i=0; i <= 6; i++){

		vm.first = vm.addMin(vm.newBookingData.endTime,30*i);
		vm.extendTimes.push(vm.first)

		} 
	});
	
    vm.deleteBooking = function() {

        vm.selectedBooking = $cookies.getObject('selectedBooking');

        //get booking id
        vm.bookingId = vm.selectedBooking.data._id;
	
	var now = new Date();
	var nowYear = now.getFullYear();
	var nowMonth = now.getMonth();
	var nowDay = now.getDate();
	var nowHour = now.getHours();
	var nowMinute = now.getMinutes();

	var bookingDate = new Date(vm.selectedBooking.startTime);
	var bookingYear = bookingDate.getFullYear();
	var bookingMonth = bookingDate.getMonth();
	var bookingDay = bookingDate.getDate();
	var bookingHour = bookingDate.getHours();
	var bookingMinute = bookingDate.getMinutes();

	//lockout code
	//if booking is cancelled less than 5 hours before booking, lock user
	console.log(vm.selectedBooking);
	console.log("current time " + nowYear+" "+nowMonth+" "+nowDay+" "+nowHour);
	console.log("booking time " + bookingYear+" "+bookingMonth+" "+bookingDay+" "+bookingHour);
	//if(bookingYear === nowYear && bookingMonth === nowMonth && bookingDay === nowDay && (nowHour - 5) <= bookingHour){
	if(bookingYear === nowYear && bookingMonth === nowMonth && bookingDay === nowDay && (nowHour - 5) <= bookingHour){

		//if true, the user will be locked out
		//calculation of the user's lockout
		nowDay++; //user is locked out until next day at same time
		var lockoutDate = {lockout: nowYear+"-"+nowMonth+"-"+nowDay+"-"+nowHour};
		console.log(lockoutDate);

//TODO: THIS CODE IS FUNCTIONAL, DON'T DELETE IT. IT'S COMMENTED OUT JUST FOR TESTING PLEASE
/*
		//using a service, the user is changed in the db
		User.lockout(vm.userData.netlinkId, lockoutDate)
			.success(function() {	 
				console.log("User was locked out.");
			})
			.error(function(data, status, headers, config) {	 
				console.log("got an error...");
				console.log(data);
				console.log(status);		
				console.log(headers);
				console.log(config);
			});
*/
//TODO: please remind me to uncomment it before handing it in
	}

        //make a DELETE http request to backend /api/deletebooking through service
        Booking.delete(vm.bookingId)
		.success(function() {	 
			console.log("Booking was deleted.");
		});

		//in backend: find booking by the passed in object id
		//delete booking once found. 
	};


});
