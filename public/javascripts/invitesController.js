/* Controller */
app.controller("invitesController", function($scope, $http, $mdMedia, $mdToast, appData) {
	
	appData.activity = "Convites";
	$scope.$emit('refresh', appData);
	$scope.password = '';
	$scope.invites = '';

	$scope.sendInvites = function(){
		if ($scope.password == '') {
			$mdToast.show($mdToast.simple()	        				
			.textContent('Preencha a senha')
			.position('bottom left')
			.hideDelay(3000));
		}
		else {
			var data = new Object();
			data.password = $scope.password;
			$scope.contacts = new Array();				
			var textLines = $scope.invites.split(/\r\n|\n/);		
			for (i = 0; i < textLines.length; i++){			
				var values = textLines[i].split(',');
				var c = new Object();
				c.name = values[0];
				c.email = values[1];
				$scope.contacts.push(c);
			}
			data.contacts = $scope.contacts;
			console.log($scope.contacts);		
			$http({
					method: 'POST',
					url: './invites',
					data: data
					})
			.success(function(data, status, headers, config){									
				if (data == 'emails sent'){						
					$mdToast.show($mdToast.simple()
					.textContent('Convites enviados')
					.position('bottom left')
					.hideDelay(3000));	        			
				}
				else{
					$mdToast.show($mdToast.simple()	        				
					.textContent('Convites não enviados')
					.position('bottom left')
					.hideDelay(3000));	
				}
			});
		}
	}	
});