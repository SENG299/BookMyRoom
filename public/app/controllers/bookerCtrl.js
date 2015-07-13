angular.module('bookerCtrl', ['bookingService', 'ngCookies', 'scheduleService', 'userService', 'authService'])

.controller('bookingCreatorController', function($rootScope, $location, Booking, $cookies, Schedule, User, Auth) {

    	var vm = this;

   	 $rootScope.modalinfo = {}
    
   	 //this object is populated with the information that will belong to the new booking
	
	vm.userData = "";
	vm.loggedIn = Auth.isLoggedIn();
	if(vm.loggedIn){
		Auth.getUser()
			.success(function(data){
				vm.userData = data;			
			});
	}

	vm.createBooking = function()
	{
		console.log("in create booking")
		//these values are from the cookies
		vm.chosenDate = new Date($cookies.getObject('chosenDate'));
		vm.selectedStartTime = $cookies.getObject('chosenStartTime');
		vm.selectedDuration = $cookies.getObject('duration').duration; 
		vm.addProjector = $cookies.getObject('equipment').projector;
		vm.addLaptop = $cookies.getObject('equipment').laptop;

		//the selectedDuration is divided by 2 because we are using integer values for each half hour increment.
		// 1 = 30 minutes, 2 = 60 minutes, 3 = 90 minutes etc...
		vm.calculateEndTime = function(){
			var decimalPart = Number(((vm.selectedDuration/2) % 1).toFixed(1));
			var integerPart = Math.floor((vm.selectedDuration/2));
			var totalHours = Number(integerPart) + Number(vm.selectedStartTime.hour);
			var totalMinutes = vm.selectedStartTime.minutes;

			if(Number(vm.selectedStartTime.minutes) === 30 && decimalPart === 0.5){
				totalMinutes = 0;
				totalHours++;
			}
			else if(vm.selectedStartTime.minutes === 0 && decimalPart === 0.5){
				totalMinutes = 30;
			}
			return {hour: totalHours, minutes: totalMinutes};
		};

		vm.finalEndTime = vm.calculateEndTime();
			vm.bookingData = {};

		//these flags disable the checkboxes for adding laptops/projectors
		vm.disableAddProjector = false;
		vm.disableAddLaptop = false;

		Booking.getBookings(vm.chosenDate.getFullYear(), vm.chosenDate.getMonth(), vm.chosenDate.getDate())
		.success(function(data)
		{	
			vm.processing = true;
			vm.message = '';	
	
			Schedule.setDay(vm.chosenDate.getDay());
	
			var startSlot = Schedule.calculateSlot(vm.selectedStartTime.hour, vm.selectedStartTime.minutes);
			var endSlot = Schedule.calculateSlot(vm.finalEndTime.hour, vm.finalEndTime.minutes); 

			var objectArrays = Schedule.buildObjectArrays(data);
			var rooms = objectArrays.rooms;
			var projectors = objectArrays.projectors;
			var laptops = objectArrays.laptops;


			var roomId = Schedule.findRoom(rooms, startSlot, endSlot);
			if(roomId == -1)
			{

                console.log("had conflict, please refresh")
                window.location.href = '/error';
				return;
			}
			
	
			var projectorId;
			var laptopId;
    
			if(vm.addLaptop){
	    			laptopId = Schedule.findLaptop(laptops, startSlot, endSlot);
			}else{
				laptopId = -1;
			}

			if(vm.addProjector){
				projectorId = Schedule.findProjector(projectors, startSlot, endSlot);
			}else{
				projectorId = -1;
			}

			//data to create new booking (hard coded for debugging)	
			vm.bookingData.netlink_id = vm.userData.netlinkId; 
			vm.bookingData.room_id = roomId; 
			vm.bookingData.projector_id = projectorId;
			vm.bookingData.laptop_id = laptopId;
			vm.bookingData.start_year = vm.chosenDate.getFullYear();
			vm.bookingData.start_month = vm.chosenDate.getMonth(); //so it is between 1 and 12
			vm.bookingData.start_day = vm.chosenDate.getDate();
			vm.bookingData.start_hour = vm.selectedStartTime.hour; //it is between 0 and 23
			vm.bookingData.start_minute = vm.selectedStartTime.minutes;	
			vm.bookingData.end_hour = vm.finalEndTime.hour;
			vm.bookingData.end_minute = vm.finalEndTime.minutes;
			
			vm.bookingData.booking_id = vm.bookingData.start_year + ":" +
							vm.bookingData.start_month + ":" +
							vm.bookingData.start_day + ":" +
							vm.bookingData.start_hour + ":" +
							vm.bookingData.start_minute + ":" + 
							vm.bookingData.end_hour + ":" +
							vm.bookingData.end_minute + ":" +
							vm.bookingData.room_id; 
			
					
			
		//the create booking service is called, vm.bookingData will populate the new booking in the db
			
			$rootScope.modalinfo = {};

			console.log("bookingData:");
			console.log(vm.bookingData);

            /*
			if (vm.bookingData.projector_id === -1){
				$rootScope.modalinfo.projector_id = "No";
			}
			if (vm.bookingData.laptop_id === -1){
				$rootScope.modalinfo.laptop_id = "No";
			}
            */
		
            $rootScope.modalinfo = vm.bookingData;
            $rootScope.modalinfo.startTime = new Date(vm.bookingData.start_year, vm.bookingData.start_month, vm.bookingData.start_day, vm.bookingData.start_hour, vm.bookingData.start_minute)

            $rootScope.modalinfo.endTime = new Date(vm.bookingData.start_year, vm.bookingData.start_month, vm.bookingData.start_day, vm.bookingData.end_hour, vm.bookingData.end_minute)

			console.log("modal data" );
			console.log($rootScope.modalinfo);

				
			Booking.create(vm.bookingData)
				.success(function(data) {
					console.log("in booking.create")
					console.log(vm.bookingData)
					vm.processing = false; 
			});
			
			
			})
			.error(function(data){
				console.log("Error when creating booking!");
				console.log(data);
			});	
		};

})

.controller('daySelectorController', function($rootScope, $location, $cookies, Schedule, User, Auth) {
	var vm = this;

	vm.loggedIn = Auth.isLoggedIn();
	if(vm.loggedIn){
		Auth.getUser()
			.success(function(data){
				vm.userData = data;			
		});
	}

	vm.dates = [
		date = new Date(),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 2),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 3),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 4),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 5),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 6)
	]; 

	vm.today = new Date();
 
	vm.updateSelectedValue = function(item){
		
		if(vm.loggedIn){
			
			console.log(vm.userData);
			vm.lockoutString = vm.userData.lockout;
			if(typeof vm.lockoutString === 'undefined'){
				vm.lockoutString = '1999-9-9-9'; //random date from the past in case the user has no lockout in the db
			}
			vm.lockoutDate = vm.lockoutString.split("-");
			vm.lockoutYear = Number(vm.lockoutDate[0]);
			vm.lockoutMonth = Number(vm.lockoutDate[1]);
			vm.lockoutDay = Number(vm.lockoutDate[2]);
			vm.lockoutHour = Number(vm.lockoutDate[3]);
			console.log("lockout "+vm.lockoutYear+" "+vm.lockoutMonth+" "+vm.lockoutDay+" "+vm.lockoutHour);
			console.log(vm.today.getFullYear());
			console.log(vm.today.getMonth());
			console.log(vm.today.getDate());
			console.log(vm.today.getHours());

			if(vm.today.getFullYear() > vm.lockoutYear){
				vm.nextView(item);
			}else{
				if(vm.today.getMonth() > vm.lockoutMonth){
					vm.nextView(item);		
				}else{
					if(vm.today.getDate() > vm.lockoutDay){
						vm.nextView(item);	
					}else if(vm.today.getDate() == vm.lockoutDay){
						if(vm.today.getHours() >= vm.lockoutHour){
							vm.nextView(item);	
						}else{
							vm.alert();
						}					
					}else{
						vm.alert();
					}
				}						
			}		
		}else{
			vm.go('/schedule');
		}	
	};

	vm.go = function ( path ) {
  		$location.path( path );
	};

	vm.nextView = function(item){
		$cookies.putObject('chosenDate', item);
		vm.go('/schedule');
	};	

	vm.alert = function(){
		alert("Sorry. You cannot book until after "+vm.lockoutYear+ "-" +(vm.lockoutMonth+1)+ "-"+vm.lockoutDay+" because you cancelled a booking within 5 hours of it's start time. Thanks!" );
	};
})

.controller('scheduleController', function($rootScope, $location, $cookies, Booking, Schedule, Auth) {

	var vm = this;
 
	vm.userData = "";
	vm.loggedIn = Auth.isLoggedIn();
	if(vm.loggedIn){
		Auth.getUser()
		.success(function(data){
			vm.userData = data;
			if (vm.userData.user_type === 3){
				vm.validDurations =
				[
				 {duration: 1},
				 {duration: 2},
				];	
			}else{
				vm.validDurations =
				[
				 {duration: 1},
				 {duration: 2},
				 {duration: 3},
				 {duration: 4},
				 {duration: 5},
				 {duration: 6}
				];	
			}	

			vm.bookingDuration = vm.validDurations[0];
			vm.chosenDate = new Date($cookies.getObject('chosenDate'));

			vm.createTimeSlots(new Date(vm.chosenDate).getDay());
			vm.selectedDuration = vm.validDurations[0];	
		});
	}

        //valid durations have to be calculated TODO: hard coded for debugging (remove when done)
        // 1 = 30 minutes, 2 = 60 minutes, 3 = 90 minutes etc...
       
	vm.equipment = {
		projector:false,
		laptop:false   
	};


	
	vm.setBookingInformation = function(){
		$cookies.putObject('duration', vm.bookingDuration);
		$cookies.putObject('chosenStartTime', vm.selectedTimeSlot);
        	$cookies.putObject('equipment', vm.equipment);
	};

	vm.lastelement = -1;
	vm.buttonToggle = function (index){
		if (vm.lastelement != -1){
			document.getElementById(vm.lastelement).style.color = "white";
           	}

            	document.getElementById(index).style.color = "black";
            	vm.lastelement = index;
	
        }
	
	vm.createTimeSlots = function()
	{
		Booking.getBookings(vm.chosenDate.getFullYear(), vm.chosenDate.getMonth(), vm.chosenDate.getDate())
		.success(function(data)
		{
	
			vm.processing = false;

			vm.bookings = data;
			vm.timeSlots = [];	
			vm.selectedTimeSlot = "";
	
			Schedule.setDay(vm.chosenDate.getDay());

			// Initialize room array
			var objectArrays = Schedule.buildObjectArrays(vm.bookings);
			var rooms = objectArrays.rooms;
			var projectors = objectArrays.projectors;
			var laptops = objectArrays.laptops;
		
			roomSchedule = Schedule.buildSchedule(rooms, vm.bookingDuration.duration);
			projectorSchedule = Schedule.buildSchedule(projectors, vm.bookingDuration.duration);
			laptopSchedule = Schedule.buildSchedule(laptops, vm.bookingDuration.duration);

			for(var i = 0; i < Schedule.numSlots; i++)
			{
				var hours = Schedule.startHour + Math.floor(i / 2);	
				var mins = (i%2 == 0) ? 0 : 30;

				var roomAvailable = (roomSchedule[i] == 0) ? true : false;			
				var laptopAvailable = (laptopSchedule[i] == 0) ? true : false;			
				var projectorAvailable = (projectorSchedule[i] == 0) ? true : false;			

				if(vm.equipment.projector)
				{
					roomAvailable = roomAvailable && projectorAvailable;
				}

				if(vm.equipment.laptop)
				{
					roomAvailable = roomAvailable && laptopAvailable;
				}

				
				
				vm.timeSlots.push({index: i,
						   hour: hours,
						   minutes: mins,
						   projector: projectorAvailable,
						   laptop: laptopAvailable,
						   room: !roomAvailable});
			}
			

		});

	};

/*
	Monday thru Friday 8 am to 10pm and on Saturdays and Sundays 11 am to 6pm. 
*/
});




