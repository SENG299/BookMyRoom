angular.module('scheduleCtrl', ['bookingService'])

.controller('scheduleController', function(Booking) {

	var vm = this;

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

			var time = 0;
			
			/* These should be set elsewhere */
			var numSlots = 48;
			var numRooms = 3;

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

				//alert("" + room_id + " " + start_slot + " " + end_slot);

				for(var j = start_slot; j <= end_slot; j++)
				{			
					rooms[room_id][j] = 1;	
				}
			}

			var schedule = buildSchedule(rooms, 2);

			
			var myString = "";
			for(var i = 0; i < rooms.length; i++)
			{
				for(var j = 0; j < rooms[0].length; j++)
				{
					myString += rooms[i][j];	
				}
				myString += "\n";
			}	
				
			alert(myString);	
			

			var mystring = "";
			for(var i = 0; i < schedule.length; i++)
			{
				mystring +=schedule[i];	
			}	
				
			alert(mystring);

			vm.test = "" + time;
		}); 

});


function scheduleTest() {

	/* Each row is a an item, each column is a 0:30 minute time slot. */
	/* These arrays are for one day. */
	var rooms = [[1,0,0,1,0,0],
		     [0,0,0,1,0,1],
		     [0,1,1,0,0,0],
		     [1,0,1,0,1,0],
		     [1,0,0,1,1,0]];

	var projectors = [[1,0,0,0,0,0],
			  [1,0,0,0,0,0],
			  [0,0,0,0,0,0],
			  [1,0,0,0,0,0],
			  [1,0,0,0,0,0]];

	var laptops = [[0,0,0,0,0,1],
		       [0,0,0,0,0,1],
		       [0,0,0,0,0,1],
		       [0,0,0,0,0,1],
		       [0,0,0,0,0,1]];

	var bookingLength = 3; /* 1 = 0:30, 2 = 1:00, 3 = 1:30 ... */

	
	var projectorSchedule = buildSchedule(projectors, bookingLength);

	var mystring = "";
	for(var i = 0; i < projectorschedule.length; i++)
	{
		mystring += projectorschedule[i];	
	}	
		
	alert(mystring);
}	

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




