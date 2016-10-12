/* Controller */
app.controller("invitesController", function($scope, $http, $mdMedia, $mdToast, appData) {
	
	appData.activity = "Convites";
	$scope.$emit('refresh', appData);	
	
});