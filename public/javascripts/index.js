angular.element(document.getElementsByTagName('head')).append(
	angular.element('<base href="' + window.location.pathname + '" />'));

var JSONtoForm = function(obj){
	var str = [];
	for (var p in obj) {		
		str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	}
	return str.join("&");
};

var app = angular.module("avalweb", ['ngMaterial']);

app.controller("indexController", function($scope, $http, $mdMedia, $mdToast, $window) {
	$scope.login = {user: '', password: ''};
	$scope.mobile = ($mdMedia('sm') || $mdMedia('xs'));

	$scope.submit = function(keyEvent){
		if(keyEvent.which == 13){
			$scope.doLogin($scope.login);
		}
	}

	$scope.doLogin = function(login){
		if(login.user != '' && login.password != ''){
			$http({
				method: 'POST',
				url: './login',				
				data: $scope.login
				})
			.success(function(data, status, headers, config){				
				if(data == "login error"){
					$mdToast.show($mdToast.simple()	        				
					.textContent('Usuário ou senha erradas')
					.position('bottom left')
					.hideDelay(3000));	
				}
				if(data == "login ok"){
					$window.location.href = '/start';
				}			
			})
			.error(function(error){				
				$mdToast.show($mdToast.simple()	        				
				.textContent('Não foi possível realizar login')
				.position('bottom left')
				.hideDelay(3000));
			});
		}
		else{
			$mdToast.show($mdToast.simple()	        				
			.textContent('Preencha os dados de usuário e senha')
			.position('bottom left')
			.hideDelay(3000));	        			
		}
	};
});