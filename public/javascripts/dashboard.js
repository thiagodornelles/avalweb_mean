angular.element(document.getElementsByTagName('head')).append(
	angular.element('<base href="' + window.location.pathname + '" />'));

var JSONtoForm = function(obj){
	var str = [];
	for (var p in obj) {		
		str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	}
	return str.join("&");
};

var indexOf_Id = function (array, id) {
	var index = -1;
	for (var i = 0; i < array.length; i++) {		
		if (array[i]._id.toString() == id.toString()) {
			index = i;
			break;
		}
	}
	return index;
}

var app = angular.module("avalweb", ['ngMaterial', 'ngRoute', 'lfNgMdFileInput']);

//Service that keeps application data between index controller and anothers
app.service('appData', function(){
	this.activity = '';	
});

//Controller for data binding to main page
app.controller("dashController", function($scope, $mdSidenav, $mdMedia, $http, $window, appData) {
	$scope.isSidenavOpen = $mdMedia('gt-md');
	$scope.activity = '';
	
	//Refresh event for update $scope data
	$scope.$on('refresh', function(event, data) {
    	$scope.activity = data.activity;
	});  

	$scope.openLeftMenu = function() {
		$mdSidenav('left').toggle();	
	};	

	$scope.menuClose = function(){
		if(!$mdMedia('gt-md')){
			$mdSidenav('left').toggle();	
		}
	}

	$scope.onSwipeLeft = function() {
		$mdSidenav('left').toggle();
	}

	$scope.logout = function(){
		$http.post('./logout', '').success(function(data, status){
			if(data == "logout ok"){
				$window.location.href = '/';
			}
		});
	}	
});

//Configurations
app.config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
       return moment(date).format('DD/MM/YYYY');
    };
});

app.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/questions', {
			templateUrl: './questionList.html',
			controller: 'questionController'		
		})
		.when('/students', {
			templateUrl: './studentList.html',
			controller: 'studentController'
		})
		.when('/tests', {
			templateUrl: './testList.html',
			controller: 'testController'
		})
		.when('/classes', {
			templateUrl: './classList.html',
			controller: 'classController'
		})
		.when('/start', {
			templateUrl: './intro.html'			
		})
		.when('/categories', {
			templateUrl: './categoryList.html',
			controller: 'categoryController'
		})
		.when('/studenttests', {
			templateUrl: './studentTestList.html',
			controller: 'studentTestController'		
		})
		.when('/reports', {
			templateUrl: './reportList.html',
			controller: 'reportController'		
		})
		.when('/invites', {
			templateUrl: './invite.html',
			controller: 'invitesController'	
		});
		
	$locationProvider.html5Mode(true);
}]);