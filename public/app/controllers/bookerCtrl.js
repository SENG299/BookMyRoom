angular.module('bookerCtrl', ['bookingService', 'sharedService'])

.controller('bookingCreatorController', function($rootScope, $location, Booking, sharedProperties) {

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
	vm.bookingData = {
		booking_id: "",
		netlink_id:"",
		room_id: "",
		projector_id: "",
		laptop_id: "",
		start_year: "",
		start_month: "",
		start_day: "",
		start_hour: "",
		start_minute: "",
		end_hour: "",
		end_minute: ""
	};

	vm.createBooking = function(){
	
		vm.processing = true;
		vm.message = '';
		
		//data to create new booking (hard coded for debugging)	
		vm.bookingData.booking_id = "2014030915fuckthis" //TODO: get this passed as a parameter
		vm.bookingData.netlink_id = "gordillo"; //TODO: get this passed as a parameter
		vm.bookingData.room_id = "A101"; //TODO: has to be dynamically found
		vm.bookingData.projector_id = "p123423"; //TODO: has to be dynamically found
		vm.bookingData.laptop_id = "l5645648"; //TODO: has to be dynamically found
		vm.bookingData.start_year = vm.chosenDate.getFullYear();
		vm.bookingData.start_month = vm.chosenDate.getMonth() + 1; //so it is between 1 and 12
		vm.bookingData.start_day = vm.chosenDate.getDate();
		vm.bookingData.start_hour = vm.chosenDate.getHours(); //it is between 0 and 23
		vm.bookingData.start_minute = vm.chosenDate.getMinutes();	
		vm.bookingData.end_hour = Number(vm.selectedEndTime.hours);
		vm.bookingData.end_minute = Number(vm.selectedEndTime.minutes);

		//the create booking service is called, vm.bookingData will populate the new booking in the db
		Booking.create(vm.bookingData)
			.success(function(data) {
				vm.processing = false;
                
                		//clear the form
				vm.bookingData = {};
				vm.message = data.message;
		});	
	};
})

.controller('daySelectorController', function($rootScope, $location, sharedProperties) {

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
	// vm.loggedIn = true;
})

.controller('scheduleController', function($rootScope, $location, Booking, sharedProperties) {

    var vm = this;

    //valid durations have to be calculated TODO: hard coded for debugging (remove when done)
    vm.validDurations = [
	     {duration: 0.5},
	     {duration: 1},
	     {duration: 1.5}
	];

    vm.equipment = {
        projector:false,
        laptop:false    
    };


    sharedProperties.setEquipment(vm.equipment);
    vm.chosenDate = sharedProperties.getchosenDate();
    vm.bookingDuration = vm.validDurations[0];
	vm.timeSlots = [];
	vm.selectedTimeSlot = "";
    
       vm.lastelement = "";

       vm.buttonToggle = function (temp){
            if (vm.lastelement != ""){
                document.getElementById(vm.lastelement).style.color = "white";
            }
            document.getElementById(temp["$$hashKey"]).style.color = "black";
            vm.lastelement = temp["$$hashKey"];
        }
    

	vm.go = function ( path ) {
		sharedProperties.setDuration(vm.bookingDuration);
		sharedProperties.setChosenStartTime(vm.selectedTimeSlot);
        sharedProperties.setEquipment(vm.equipment);
  		$location.path( path );
	};



	vm.createTimeSlots = function(day){

		Booking.getAllBookings()
			.success(function(data) {
	
			vm.processing = false;

			vm.bookings = data;

			vm.bookings =  [
				    {
					"_id": 1,
					"room_id": 0,
					"end_minute": 30,
					"end_hour": 6,
					"start_minute": 30,
					"start_hour": 4,
					"start_day": 3,
					"start_month": 4,
					"start_year": 2014	
				    },
				    {
					"_id": 2,
					"room_id": 1,
					"end_minute": 0,
					"end_hour": 6,
					"start_minute": 0,
					"start_hour": 4,
					"start_day": 3,
					"start_month": 4,
					"start_year": 2014
				    },
				    {
					"_id": 3,
					"room_id": 2,
					"end_minute": 30,
					"end_hour": 6,
					"start_minute": 30,
					"start_hour": 4,
					"start_day": 3,
					"start_month": 4,
					"start_year": 2014
				    }
				];

			var numSlots = 28;
			var numRooms = 3;
			var numProjectors = 3;
			var numLaptops = 3;

			var startHour = 8;

			if(day > 5 || day == 0)
			{
				//it's a weekend
				numSlots = 14;	
				startHour = 11;
			}	

			var time = 0;
				
			/* Initialize room array */
			var rooms = new Array(numRooms);
			for(var i = 0; i < numRooms; i++)
			{
				rooms[i] = Array.apply(null, Array(numSlots)).map(Number.prototype.valueOf, 0);	
			}
	
		        for(var i = 0; i < vm.bookings.length; i++)	
			{					
				var room_id = vm.bookings[i].room_id;
				var start_slot = (vm.bookings[i].start_hour * 2) + (vm.bookings[i].start_minute / 30);
				var end_slot = (vm.bookings[i].end_hour * 2) + (vm.bookings[i].end_minute / 30);	

				for(var j = start_slot; j <= end_slot; j++)
				{			
					rooms[room_id][j] = 1;	
				}
			}

			roomSchedule = buildSchedule(rooms, 2);

			for(var i = 0; i < numSlots; i++)
			{
				var hours = startHour + Math.floor(i / 2);	
				var mins = (i%2 == 0) ? 0 : 30;

				var roomAvailable = (roomSchedule[i] == 0) ? true : false;			

				vm.timeSlots.push({hour: hours, minutes: mins, projector: roomAvailable, laptop: true, avail: true});
			}
			

		});
	
	};

	vm.createTimeSlots(new Date(vm.chosenDate).getDay());
	vm.selectedDuration = vm.validDurations[0];
	
	
	
/*
	Monday thru Friday 8 am to 10pm and on Saturdays and Sundays 11 am to 6pm. 
*/

});


//Function to build an object schedule. Outside controllers for now.
//
//Input: 2D array where each column is a half hour slot and 
//	 each row is a is an object (room, projector, laptop).
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


