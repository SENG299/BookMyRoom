angular.module('scheduleService', [])

.factory('Schedule', function($http) {

	var scheduleFactory = {};

	scheduleFactory.numRooms = 3;
	scheduleFactory.numProjectors = 2;
	scheduleFactory.numLaptops = 2;

	scheduleFactory.numSlots = 28;
	scheduleFactory.startHour = 8; 


	scheduleFactory.setDay = function(day)
	{
		if(day == 6 || day == 0)
		{
			scheduleFactory.numSlots = 14;
			scheduleFactory.startHour = 11;
		}
		else
		{
			scheduleFactory.numSlots = 28;
			scheduleFactory.startHour = 8;	
		} 
	};

	scheduleFactory.calculateSlot = function(hour, minute)
	{
		return ((hour - scheduleFactory.startHour) * 2) + Math.floor(minute / 30);	
	};

	scheduleFactory.buildObjectArrays = function(bookings)
	{
		var startHour = scheduleFactory.startHour;
		var numSlots = scheduleFactory.numSlots;
			
		var numRooms = scheduleFactory.numRooms;
		var numProjectors = scheduleFactory.numProjectors;
		var numLaptops = scheduleFactory.numLaptops;

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

			var startSlot = this.calculateSlot(bookings[i].start_hour, bookings[i].start_minute, startHour);
			var endSlot = this.calculateSlot(bookings[i].end_hour, bookings[i].end_minute, startHour);

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
	};

	scheduleFactory.findLaptop = function(laptops, startSlot, endSlot)
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
	};

	scheduleFactory.findProjector = function(projectors, startSlot, endSlot)
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
	};

	scheduleFactory.findRoom = function(rooms, startSlot, endSlot)
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
	};

	scheduleFactory.buildSchedule = function(objectArray2D, bookingLength)
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
	};


	return scheduleFactory;
});
