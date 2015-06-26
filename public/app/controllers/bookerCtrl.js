angular.module('bookerCtrl', ['bookingService'])

.controller('bookingCreatorController', function($rootScope, $location, Booking) {

    	var vm = this;

	//these variables should be initialized with the parameters passed to the controller 
	vm.chosenDate = new Date(2015, 05, 05, 05, 30, 0, 0);

	vm.validEndTimes = [
	     { hours: 5, minutes: 30, time: "5:30" },
	     { hours: 6, minutes: 30, time: "6:30" },
	     { hours: 7, minutes: 30, time: "7:30" }
	];
	
	vm.selectedEndTime = { hours: 0, minutes: 0, time: "00:00" }; //this value contains the real time value of the selected dropdown option

	vm.addProjector = false;
	vm.addLaptop = false;
	vm.disableAddProjector = false;
	vm.disableAddLaptop = false;

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
		vm.bookingData.booking_id = "2014030915"
		vm.bookingData.netlink_id = "gordillo";
		vm.bookingData.room_id = "A101"; //has to be dynamically found
		vm.bookingData.projector_id = "p123423"; //has to be dynamically found
		vm.bookingData.laptop_id = "l5645648"; //has to be dynamically found
		vm.bookingData.start_year = vm.chosenDate.getFullYear();
		vm.bookingData.start_month = vm.chosenDate.getMonth() + 1; //so it is between 1 and 12
		vm.bookingData.start_day = vm.chosenDate.getDate();
		vm.bookingData.start_hour = vm.chosenDate.getHours() + 1; //so it is between 1 and 24
		vm.bookingData.start_minute = vm.chosenDate.getMinutes();	
		vm.bookingData.end_hour = Number(vm.selectedEndTime.hours);
		vm.bookingData.end_minute = Number(vm.selectedEndTime.minutes);

		Booking.create(vm.bookingData)
			.success(function(data) {
				vm.processing = false;
                
                		//clear the form
				vm.userData = {};
				vm.message = data.message;
			});	
	};
});

