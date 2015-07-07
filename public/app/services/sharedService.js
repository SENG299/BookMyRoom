angular.module('sharedService', [])
    .service('sharedProperties', function () {
    	
            this.chosenDate = "";
            this.duration = "";
            this.chosenStartTime = "";
            this.laptop="";
            this.projector ="";
                
   

            this.getchosenDate = function () {
                return this.chosenDate;
            };
	
		    this.setchosenDate = function(value) {	        
	            this.chosenDate = value;      
	        };

	        this.getDuration = function(){
	        	return this.duration;
	        };

	        this.setDuration = function(value){
	        	this.duration = value;
	        };

	        this.getChosenStartTime = function(){
	        	return this.chosenStartTime;
	        };

	        this.setChosenStartTime = function(value){
	        	this.chosenStartTime = value;
	        };
    
            this.setEquipment = function( equ ){
                
                this.projector = equ.projector;
                this.laptop = equ.laptop;

            }

            this.getEquipment = function(){
               
               this.equ = {
                
                   projector:this.projector,
                   laptop:this.laptop
                
                }
            
               
                   return equ;
            }
});
