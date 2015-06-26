angular.module('bookerCtrl', ['bookingService'])

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


.controller('daySelectorController', function($rootScope, $location, Booking) {

    	var vm = this;
	vm.chosenDate = "";
	vm.dates = [
		date = new Date(),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 2),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 3),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 4),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 5),
		date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 6)
	]; 

	vm.updateSelectedValue = function(item){
		vm.chosenDate = item;	
	};
});



