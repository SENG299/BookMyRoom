angular.module('bookerCtrl', ['bookingService', 'ngCookies', 'scheduleService'])

.controller('bookingCreatorController', function($rootScope, $location, Booking, $cookies, Schedule) {

    var vm = this;

    $rootScope.modalinfo = {}
    
    //this object is populated with the information that will belong to the new booking
	

	vm.createBooking = function()
	{


        console.log("in create booking")

        //these values are from the cookies
        vm.chosenDate = new Date($cookies.getObject('chosenDate'));
	    vm.selectedStartTime = $cookies.getObject('chosenStartTime');
	    vm.selectedDuration = $cookies.getObject('duration').duration; 
        vm.addProjector = $cookies.getObject('equipment').projector;
	    vm.addLaptop = $cookies.getObject('equipment').laptop;
      

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
        vm.bookingData = {};

		//these flags disable the checkboxes for adding laptops/projectors
		vm.disableAddProjector = false;
		vm.disableAddLaptop = false;

		//console.log(vm.selectedStartTime, vm.selectedDuration, vm.finalEndTime, vm.chosenDate);

		Booking.getBookings(vm.chosenDate.getFullYear(), vm.chosenDate.getMonth(), vm.chosenDate.getDate())
		.success(function(data)
		{	
			console.log("Success");
			vm.processing = true;
			vm.message = '';
		
			var numSlots = 28;
			var startHour = 8;

			//it's a weekend
			var day = vm.chosenDate.getDay();
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
			vm.bookingData.netlink_id = "bunny"; 
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

            $rootScope.modalinfo = vm.bookingData;
            
                console.log("data to create booking" );
                console.log($rootScope.modalinfo);

			Booking.create(vm.bookingData)
				.success(function(data) {
					vm.processing = false; 
                    console.log("hello");
			});
            
            
		})
		.error(function(data){
			console.log("HERE");
			console.log(data);
		});
        
		console.log("HERE@")
	};




    vm.clearBookingData = function () {
        //clear the form
		vm.bookingData = {};
        
    };
    
    
    vm.deleteBooking = function() {

        console.log("want to delete");
        vm.selectedBooking = $cookies.getObject('selectedBooking');
        console.log(vm.selectedBooking);

        //get booking id
        vm.bookingId = vm.selectedBooking.data._id;
     
        //make a DELETE http request to backend /api/deletebooking through service
        Booking.delete(vm.bookingId)
				.success(function() {	 
					
					console.log("did it delete?");
                  
            
			    });

        //in backend: find booking by the passed in object id
        //delete booking once found. 
        
	};

})

.controller('daySelectorController', function($rootScope, $location, $cookies, Schedule) {

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

		if(vm.today.getFullYear() >= vm.lockoutYear && (vm.today.getMonth()) >= vm.lockoutMonth && vm.today.getDate() > vm.lockoutDay && vm.today.getHours() > vm.lockoutHour){
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

.controller('scheduleController', function($rootScope, $location, $cookies, Booking, Schedule) {

       var vm = this;

        //valid durations have to be calculated TODO: hard coded for debugging (remove when done)
        // 1 = 30 minutes, 2 = 60 minutes, 3 = 90 minutes etc...
        vm.validDurations =
	[
	     {duration: 1},
	     {duration: 2},
	     {duration: 3}
	];

    vm.equipment = {
        projector:false,
        laptop:false    
    };


    vm.bookingDuration = vm.validDurations[0];
	vm.chosenDate = new Date($cookies.getObject('chosenDate'));
        vm.bookingDuration = vm.validDurations[0];
	vm.timeSlots = [];
	vm.selectedTimeSlot = "";
    

	vm.setBookingInformation = function(){
		$cookies.putObject('duration', vm.bookingDuration);
		$cookies.putObject('chosenStartTime', vm.selectedTimeSlot);
        $cookies.putObject('equipment', vm.equipment);
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
		Booking.getBookings(vm.chosenDate.getFullYear(), vm.chosenDate.getMonth(), vm.chosenDate.getDate())
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




