angular.module('userApp', [

    'ngAnimate',
    'app.routes',
    'authService',
    'bookerCtrl',
    'editCtrl',
    'bookingService',
    'scheduleService',
    'userService',
    'loginCtrl',
    'profileCtrl',
    'ui.bootstrap'

])


// application configuration to integrate token into requests
.config(function($httpProvider) {
    // attach our auth interceptor to the http requests
    $httpProvider.interceptors.push('AuthInterceptor');
});
