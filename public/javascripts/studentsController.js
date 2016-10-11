/* Controller */
app.controller("studentController", function($scope, $http, $mdDialog, $mdMedia, $mdToast, appData) {
	
	appData.activity = "Alunos";
	$scope.$emit('refresh', appData);	

	$scope.refreshList = function(){
		$http.get('/students/search')
		.then(function(res){
			$scope.students = res.data;					
		},
		function(res){
			$scope.students = [];				
		});
	}

	//carregando dados
	$scope.refreshList();

	$scope.openDialogStudent = function(ev, q){
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
		$mdDialog.show({
			controller: studentDialogController,
			templateUrl: './studentDialog.html',
			parent: angular.element(document.body),
			locals:{
				student: q
			},
			targetEvent: ev,					
			clickOutsideToClose: true,
			fullscreen: true,
			openFrom: '#fab_add_student',
			closeTo: '#fab_add_student'
		})				
		.then(function(answer) {
			$scope.refreshList();				
		},
		function() {}
		);
	}

	$scope.removeStudent = function(ev, id){				
		var confirm = $mdDialog.confirm()
		.title('Remover?')
		.textContent('Tem certeza que deseja remover este aluno?')
		.targetEvent(ev)		
		.ok('Sim, remover')
		.cancel('Cancelar');

		$mdDialog.show(confirm)
		.then(function() {
			$http.delete('/students/id/' + id)
			.success(function(data, status, headers, config){						
				if (data == 'student removed'){
					$mdToast.show($mdToast.simple()
					.textContent('Aluno removido com sucesso')
					.position('bottom left')
					.hideDelay(3000));			
				}
				else{
					$mdToast.show($mdToast.simple()	        				
					.textContent('Erro ao remover aluno')
					.position('bottom left')
					.hideDelay(3000));	
				}
				$scope.refreshList();
			});					
		}, function() {});
	}
});

//Fim do controlador

var studentDialogController = function($scope, $mdDialog, $http, $mdToast, student) {
	$scope.student = {};
	if(student == ''){		
		$scope.student.birthDate = new Date();
	}
	else{
		$scope.student = angular.copy(student);
		$scope.student.birthDate = new Date(student.birthDate);
	}

	$scope.cancel = function() {
		$mdDialog.cancel();
	};			
	$scope.saveStudent = function(answer, id){				
		if(!id){				
			$http({
				method: 'POST',
				url: './students',
				// headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				// transformRequest: JSONtoForm,					
				data: $scope.student
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(answer);					
				if (data == 'student saved'){						
					$mdToast.show($mdToast.simple()
					.textContent('Dados salvos com sucesso')
					.position('bottom left')
					.hideDelay(3000));	        			
				}
				else{
					$mdToast.show($mdToast.simple()	        				
					.textContent('Dados não foram salvos')
					.position('bottom left')
					.hideDelay(3000));	        			
				}
			});
		}
		else{					
			$http({
				method: 'PUT',
				url: './students/id/'+ $scope.student._id,
				// headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				// transformRequest: JSONtoForm,					
				data: $scope.student
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(answer);					
				if (data == 'student saved'){						
					$mdToast.show($mdToast.simple()
					.textContent('Dados salvos com sucesso')
					.position('bottom left')
					.hideDelay(3000));	        			
				}
				else{
					$mdToast.show($mdToast.simple()	        				
					.textContent('Dados não foram salvos')
					.position('bottom left')
					.hideDelay(3000));	        			
				}
			});	
		}
	};
}		