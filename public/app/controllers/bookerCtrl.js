angular.module('bookerCtrl', ['bookingService', 'sharedService'])

.controller('bookingCreatorController', function($rootScope, $location, Booking) {

    	var vm = this;

	//TODO: these variables should be initialized with the parameters passed to the controller 
	vm.chosenDate = new Date();


	// TODO: validEndTimes should be populated by parameters passed 
	vm.validEndTimes = [
	     { hours: 5, minutes: 30, time: "5:30" },
	     { hours: 6, minutes: 30, time: "6:30" },
	     { hours: 7, minutes: 30, time: "7:30" }
	];
	
	vm.selectedEndTime = { hours: 0, minutes: 0, time: "00:00" }; //this value contains the real time value of the selected dropdown option

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

		//th create booking service is called, vm.bookingData will populate the new booking in the db
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
})

.controller('scheduleController', function($rootScope, $location, sharedProperties) {

    	var vm = this;
	vm.timeSlots = [];
	vm.selectedEndTime = "";
	vm.selectedTimeSlot = "";

	vm.go = function ( path ) {
  		$location.path( path );
	};

	vm.createTimeSlots = function(day){

		var numberOfTimeSlots = 28;
		var hours = 8;
		console.log('day is ' + day);
		if(day > 5 || day == 0){
			//it's a weekend
			numberOfTimeSlots = 14;	
			hours = 11;
		}

		var i;
		
		/*
			TODO: populate the projector, laptop, and avail fields from the data of the calculated schedule object
		*/

		for(i = 0; i < numberOfTimeSlots; i++){
			var mins = (i%2 == 0) ? 0 : 30;
			vm.timeSlots.push({hour: hours, minutes: mins, projector: false, laptop: true, avail: true});

			if(i%2 != 0){
				hours++;
			}
		}
	};

	vm.chosenDate = sharedProperties.getchosenDate();
	vm.createTimeSlots(new Date(vm.chosenDate).getDay());
	

	vm.validDurations = [
	     {duration: 0.5},
	     {duration: 1},
	     {duration: 1.5}
	];

	vm.selectedDuration = vm.validDurations[0];
	
/*
	Monday thru Friday 8 am to 10pm and on Saturdays and Sundays 11 am to 6pm. 

*/

});



