angular.module('sharedService', [])
    .service('sharedProperties', function () {
            this.chosenDate = "";

            this.getchosenDate = function () {
                return this.chosenDate;
            };
	
	    this.setchosenDate = function(value) {
                this.chosenDate = value;      
        };
});
