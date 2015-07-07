angular.module('bookerCtrl', ['bookingService', 'sharedService', 'scheduleService'])

.controller('bookingCreatorController', function($rootScope, $location, Booking, sharedProperties, Schedule) {

    var vm = this;

	//these values are grabbed from the shared service for the controllers
	vm.chosenDate = sharedProperties.getchosenDate();
	vm.selectedStartTime = sharedProperties.getChosenStartTime();
	vm.selectedDuration = sharedProperties.getDuration().duration; 

	vm.calculateEndTime = function(){
		var decimalPart = Number((vm.selectedDuration % 1).toFixed(1));
		var integerPart = Math.floor(vm.selectedDuration);
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

	//this variables represent the current value of the checkboxes
	//true = user wants to add laptop/projector
	//false = user doesn't want to add laptop/projector 
	vm.addProjector = false;
	vm.addLaptop = false;

	//these flags disable the checkboxes for adding laptops/projectors
	vm.disableAddProjector = false;
	vm.disableAddLaptop = false;

	//this object is populated with the information that will belong to the new booking
	vm.bookingData = {};

	vm.createBooking = function()
	{
		Booking.getBookings(vm.chosenDate.getFullYear(), vm.chosenDate.getMonth()+1, vm.chosenDate.getDate())
		.success(function(data)
		{	
			vm.processing = true;
			vm.message = '';
		
			var numSlots = 28;
			var startHour = 8;

			//it's a weekend
			var day = 1;
			if(day > 5 || day == 0)
			{
				numSlots = 14;	
				startHour = 11;
			}	
		
			var startSlot = Schedule.calculateSlot(vm.selectedStartTime.hour, vm.selectedStartTime.minutes, startHour);
			var endSlot = Schedule.calculateSlot(vm.finalEndTime.hour, vm.finalEndTime.minutes, startHour); 

			var objectArrays = Schedule.buildObjectArrays(numSlots, startHour, data);
			var rooms = objectArrays.rooms;
			var projectors = objectArrays.projectors;
			var laptops = objectArrays.laptops;

			var roomId = Schedule.findRoom(rooms, startSlot, endSlot);
			var projectorId = Schedule.findProjector(projectors, startSlot, endSlot);
			var laptopId = Schedule.findLaptop(laptops, startSlot, endSlot);
			console.log(roomId + " " + projectorId + " " + laptopId);
				
			//data to create new booking (hard coded for debugging)	
			vm.bookingData.netlink_id = "gordillo"; 
			vm.bookingData.room_id = roomId; 
			vm.bookingData.projector_id = projectorId;
			vm.bookingData.laptop_id = laptopId;
			vm.bookingData.start_year = vm.chosenDate.getFullYear();
			vm.bookingData.start_month = vm.chosenDate.getMonth() + 1; //so it is between 1 and 12
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
			Booking.create(vm.bookingData)
				.success(function(data) {
					vm.processing = false; 
					 
					//clear the form
					vm.bookingData = {};
					vm.message = data.message;
			});
		});	
	};
})

.controller('daySelectorController', function($rootScope, $location, sharedProperties, Schedule) {

  var vm = this;
	vm.userDate = sharedProperties.getchosenDate();
	vm.dates = [
		date = new Date(),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 2),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 3),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 4),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 5),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 6)
	]; 

	vm.today = new Date()

	vm.updateSelectedValue = function(item){
		sharedProperties.setchosenDate(item);
		vm.go('/schedule');	
	};

	vm.go = function ( path ) {
  		$location.path( path );
	};
})

.controller('scheduleController', function($rootScope, $location, Booking, sharedProperties, Schedule) {

       var vm = this;

        //valid durations have to be calculated TODO: hard coded for debugging (remove when done)
        // 1 = 30 minutes, 2 = 60 minutes, 3 = 90 minutes etc...
        vm.validDurations =
	[
	     {duration: 1},
	     {duration: 2},
	     {duration: 3}
	];

        vm.chosenDate = sharedProperties.getchosenDate();
        vm.bookingDuration = vm.validDurations[0];
	vm.timeSlots = [];
	vm.selectedTimeSlot = "";

	vm.go = function ( path ) {
		sharedProperties.setDuration(vm.bookingDuration);
		sharedProperties.setChosenStartTime(vm.selectedTimeSlot);
  		$location.path( path );
	};

	vm.createTimeSlots = function(day)
	{
		Booking.getBookings(vm.chosenDate.getFullYear(), vm.chosenDate.getMonth()+1, vm.chosenDate.getDate())
		.success(function(data)
		{
	
			vm.processing = false;

			vm.bookings = data;

			var numSlots = 28;
			var startHour = 8;

			//it's a weekend
			if(day > 5 || day == 0)
			{
				numSlots = 14;	
				startHour = 11;
			}	

			// Initialize room array
			var objectArrays = Schedule.buildObjectArrays(numSlots, startHour, vm.bookings);
			var rooms = objectArrays.rooms;
			var projectors = objectArrays.projectors;
			var laptops = objectArrays.laptops;

			roomSchedule = Schedule.buildSchedule(rooms, 1);
			projectorSchedule = Schedule.buildSchedule(projectors, 1);
			laptopSchedule = Schedule.buildSchedule(laptops, 1);

			for(var i = 0; i < numSlots; i++)
			{
				var hours = startHour + Math.floor(i / 2);	
				var mins = (i%2 == 0) ? 0 : 30;

				var roomAvailable = (roomSchedule[i] == 0) ? true : false;			
				var laptopAvailable = (laptopSchedule[i] == 0) ? true : false;			
				var projectorAvailable = (projectorSchedule[i] == 0) ? true : false;			

				vm.timeSlots.push({hour: hours,
						   minutes: mins,
						   projector: projectorAvailable,
						   laptop: roomAvailable,
						   avail: roomAvailable});
			}
			

		});
	
	};

	vm.createTimeSlots(new Date(vm.chosenDate).getDay());
	vm.selectedDuration = vm.validDurations[0];	
/*
	Monday thru Friday 8 am to 10pm and on Saturdays and Sundays 11 am to 6pm. 
*/

});

