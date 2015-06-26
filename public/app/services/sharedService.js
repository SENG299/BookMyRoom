angular.module('sharedService', [])
    .service('sharedProperties', function () {
        var chosenDate = "";

        return {
            getchosenDate: function () {
                return chosenDate;
            },
            setchosenDate: function(value) {
                chosenDate = value;
            }
        };
    });
