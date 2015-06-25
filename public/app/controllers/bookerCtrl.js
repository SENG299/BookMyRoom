angular.module('bookerCtrl', [])

.controller('bookerController', function($rootScope, $location) {

    	var vm = this;
	
	vm.chosenDate = new Date(2014, 03, 03, 3);
	vm.validEndTimes = [{"time":"1:00PM"}, {"time":"2:00PM"}];
	vm.addProjector = true;
	vm.addLaptop = false;


});
