angular.module('bookerCtrl', ['bookingService', 'ngCookies'])

.controller('bookingCreatorController', function($rootScope, $location, $cookies, Booking) {

    var vm = this;

	//these values are from the cookies
	vm.chosenDate = new Date($cookies.getObject('chosenDate'));
	vm.selectedStartTime = $cookies.getObject('chosenStartTime');
	vm.selectedDuration = $cookies.getObject('duration').duration; 

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
		Booking.getAllBookings()
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
		
			var startSlot = calculateSlot(vm.selectedStartTime.hour, vm.selectedStartTime.minutes, startHour);
			var endSlot = calculateSlot(vm.finalEndTime.hour, vm.finalEndTime.minutes, startHour); 

			var objectArrays = buildObjectArrays(numSlots, startHour, data);
			var rooms = objectArrays.rooms;
			var projectors = objectArrays.projectors;
			var laptops = objectArrays.laptops;

			var roomId = findRoom(rooms, startSlot, endSlot);
			var projectorId = findProjector(projectors, startSlot, endSlot);
			var laptopId = findLaptop(laptops, startSlot, endSlot);
			alert(roomId + " " + projectorId + " " + laptopId);
				
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

.controller('daySelectorController', function($rootScope, $location, $cookies) {

  var vm = this;
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

		vm.lockoutDate = "2015-1-6-8".split("-"); //TODO: this lockout date should be grabbed from the user's lockout date in the db or the "session"
		vm.lockoutYear = Number(vm.lockoutDate[0]);
		vm.lockoutMonth = Number(vm.lockoutDate[1]);
		vm.lockoutDay = Number(vm.lockoutDate[2]);
		vm.lockoutHour = Number(vm.lockoutDate[3]);

		if(vm.today.getFullYear() >= vm.lockoutYear && (vm.today.getMonth() + 1) >= vm.lockoutMonth && vm.today.getDate() > vm.lockoutDay && vm.today.getHours() > vm.lockoutHour){
			$cookies.putObject('chosenDate', item);
			vm.go('/schedule');
		}else{
			alert('Sorry. You cannot book until after '+vm.lockoutYear+ "-" +vm.lockoutMonth+ "-"+vm.lockoutDay+' because you cancelled a booking within 5 hours of its start time. Thanks!' );
		}	
	};

	vm.go = function ( path ) {
  		$location.path( path );
	};	
})

.controller('scheduleController', function($rootScope, $location, $cookies, Booking) {

       var vm = this;

        //valid durations have to be calculated TODO: hard coded for debugging (remove when done)
        // 1 = 30 minutes, 2 = 60 minutes, 3 = 90 minutes etc...
        vm.validDurations =
	[
	     {duration: 1},
	     {duration: 2},
	     {duration: 3}
	];

	vm.chosenDate = $cookies.getObject('chosenDate');
        vm.bookingDuration = vm.validDurations[0];
	vm.timeSlots = [];
	vm.selectedTimeSlot = "";

	vm.go = function ( path ) {
		$cookies.putObject('duration', vm.bookingDuration);
		$cookies.putObject('chosenStartTime', vm.selectedTimeSlot);
  		$location.path( path );
	};

	vm.lastelement = "";

       vm.buttonToggle = function (temp){
            if (vm.lastelement != ""){
                document.getElementById(vm.lastelement).style.color = "white";
            }
            document.getElementById(temp["$$hashKey"]).style.color = "black";
            vm.lastelement = temp["$$hashKey"];
        }
	
	vm.createTimeSlots = function(day)
	{
		Booking.getAllBookings()
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
			var objectArrays = buildObjectArrays(numSlots, startHour, vm.bookings);
			var rooms = objectArrays.rooms;
			var projectors = objectArrays.projectors;
			var laptops = objectArrays.laptops;

			roomSchedule = buildSchedule(rooms, 1);
			projectorSchedule = buildSchedule(projectors, 1);
			laptopSchedule = buildSchedule(laptops, 1);

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


function calculateSlot(hour, minute, startHour)
{
	return ((hour - startHour) * 2) + Math.floor(minute / 30);	
}

function buildObjectArrays(numSlots, startHour, bookings)
{
	var numRooms = 3;
	var numProjectors = 3;
	var numLaptops = 3;

	var rooms = new Array(numRooms);
	var projectors = new Array(numProjectors);
	var laptops = new Array(numLaptops);

	for(var i = 0; i < numRooms; i++){
		rooms[i] = Array.apply(null, Array(numSlots)).map(Number.prototype.valueOf, 0);
	}
	for(var i = 0; i < numProjectors; i++){
		projectors[i] = Array.apply(null, Array(numSlots)).map(Number.prototype.valueOf, 0);	
	}
	for(var i = 0; i < numLaptops; i++){
		laptops[i] = Array.apply(null, Array(numSlots)).map(Number.prototype.valueOf, 0);	
	}

	for(var i = 0; i < bookings.length; i++)	
	{					
		var roomId = bookings[i].room_id;
		var projectorId = bookings[i].projector_id;
		var laptopId = bookings[i].laptop_id;

		var startSlot = calculateSlot(bookings[i].start_hour, bookings[i].start_minute, startHour);
		var endSlot = calculateSlot(bookings[i].end_hour, bookings[i].end_minute, startHour);

		for(var j = startSlot; j < endSlot; j++)
		{			
			rooms[roomId][j] = 1;

			if(projectorId != -1){	
				projectors[projectorId][j] = 1;
			}
			if(laptopId != -1){
				laptops[laptopId][j] = 1;
			}	
		}
	}

	var objectArrays = 
	{
		rooms: rooms,
		projectors: projectors,
		laptops: laptops
	}	
	
	return objectArrays;
}

function findLaptop(laptops, startSlot, endSlot)
{
	var numLaptops = laptops.length;
	var laptopId = -1;
	
	for(var i = 0; i < numLaptops; i++)
	{		
		var taken = 0;
		for(var j = startSlot; j < endSlot; j++)
		{
			if(laptops[i][j] == 1)
			{
				taken = 1;
				break;
			}
		}	
			
		if(taken == 0)
		{
			laptopId = i;
			break;
		}
	}	

	return laptopId;
}

function findProjector(projectors, startSlot, endSlot)
{
	var numProjectors = projectors.length;
	var projectorId = -1;
	
	for(var i = 0; i < numProjectors; i++)
	{		
		var taken = 0;
		for(var j = startSlot; j < endSlot; j++)
		{
			if(projectors[i][j] == 1)
			{
				taken = 1;
				break;
			}
		}	
			
		if(taken == 0)
		{
			projectorId = i;
			break;
		}
	}	

	return projectorId;
}

function findRoom(rooms, startSlot, endSlot)
{
	var numRooms = rooms.length;
	var roomId = -1;
	
	for(var i = 0; i < numRooms; i++)
	{		
		var taken = 0;
		for(var j = startSlot; j < endSlot; j++)
		{
			if(rooms[i][j] == 1)
			{
				taken = 1;
				break;
			}
		}	
			
		if(taken == 0)
		{
			roomId = i;
			break;
		}
	}	

	return roomId;
}

//Function to build an object schedule. Outside controllers for now.
//
//Input: 2D array where each column is a half hour slot and 
//	 each row is an object (room, projector, laptop).
//	 An entry is 1 if the time slot is taken for that object and
//	 0 if it isn't taken. Booking length: 1 = 30 minutes, 2 = 60 minutes
//	 3 = 90 minutes ect.
//
//Output: Returns an array where an entry is 1 if all objects are taken for 
//	  that slot and 0 if at least one object is available.
function buildSchedule(objectArray2D, bookingLength)
{	
	var numObjects = objectArray2D.length;
	var numSlots = objectArray2D[0].length;

	var schedule = Array.apply(null, Array(numSlots)).map(Number.prototype.valueOf, 1);

	for(var y = 0; y < numSlots; y++)
	{
		for(var x = 0; x < numObjects; x++)
		{	
			var taken = 0;
			for(var i = 0; i < bookingLength; i++)
			{
				var slot = y + i;
				if(slot >= numSlots || objectArray2D[x][slot] == 1)
				{
					taken = 1;
					break;
				}
			}

			if(taken == 0)
			{
				schedule[y] = 0;
				break;
			}
		}
	}
	
	return schedule;
}


