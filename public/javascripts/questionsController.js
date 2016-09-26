/* Controller */
app.controller("questionController", function($scope, $http, $mdDialog, $mdMedia, $mdToast, appData) {
	
	appData.activity = "Questões";
	$scope.$emit('refresh', appData);

	$scope.refreshList = function(){
		$http.get('/questions/search')
		.then(function(res){
			$scope.questions = res.data;					
		},
		function(res){
			$scope.questions = [];				
		});		
	}

	//carregando dados
	$scope.refreshList();

	$scope.openDialogQuestion = function(ev, q){				
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));				
		$mdDialog.show({
			controller: questionDialogController,
			templateUrl: './questionDialog.html',
			parent: angular.element(document.body),
			locals:{
				question: q
			},
			targetEvent: ev,					
			clickOutsideToClose: true,
			fullscreen: true,
			openFrom: '#fab_add_question',
			closeTo: '#fab_add_question'
		})				
		.then(function(answer) {
			$scope.refreshList();					
		},
		function() {}
		);
	}

	$scope.removeQuestion = function(ev, id){				
		var confirm = $mdDialog.confirm()
		.title('Remover?')
		.textContent('Tem certeza que deseja remover esta questão?')				
		.targetEvent(ev)		
		.ok('Sim, remover')
		.cancel('Cancelar');

		$mdDialog.show(confirm)
		.then(function() {
			$http.delete('/questions/id/' + id)
			.success(function(data, status, headers, config){						
				if (data == 'question removed'){
					$mdToast.show($mdToast.simple()
					.textContent('Questão removida com sucesso')
					.position('bottom left')
					.hideDelay(3000));			
				}
				else{
					$mdToast.show($mdToast.simple()	        				
					.textContent('Erro ao remover questão')
					.position('bottom left')
					.hideDelay(3000));	
				}
				$scope.refreshList();
			});					
		}, function() {});
	}	
});

//Fim do controlador

var questionDialogController = function($scope, $mdDialog, $http, $mdToast, question) {		
	$scope.question = angular.copy(question);	

	$scope.cancel = function() {
		$mdDialog.cancel();
	};			
	$scope.saveQuestion = function(answer, id){				
		if(!id){				
			$http({
				method: 'POST',
				url: './questions',
				data: $scope.question
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(answer);					
				if (data == 'question saved'){						
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
				url: './questions/id/'+ $scope.question._id,				
				data: $scope.question
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(answer);					
				if (data == 'question saved'){						
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