/* Controller */
app.controller("testController", function($scope, $http, $mdDialog, $mdMedia, $mdToast, appData) {
	
	appData.activity = "Avaliações";
	$scope.$emit('refresh', appData);	

	$scope.refreshList = function(){
		$http.get('/tests/search')
		.then(function(res){
			$scope.tests = res.data;					
		},
		function(res){
			$scope.tests = [];				
		});
	}

	//carregando dados
	$scope.refreshList();

	$scope.openDialogTest = function(ev, q){		
		$mdDialog.show({
			controller: testDialogController,
			templateUrl: './testDialog.html',
			parent: angular.element(document.body),
			locals:{
				test: q
			},			
			targetEvent: ev,					
			clickOutsideToClose: true,
			fullscreen: true,
			openFrom: '#fab_add_test',
			closeTo: '#fab_add_test'
		})				
		.then(function(event) {
			$scope.refreshList();				
		},
		function() {}
		);
	}

	$scope.removeTest = function(ev, id){				
		var confirm = $mdDialog.confirm()
		.title('Remover?')
		.textContent('Tem certeza que deseja remover esta avaliação?')
		.targetEvent(ev)		
		.ok('Sim, remover')
		.cancel('Cancelar');

		$mdDialog.show(confirm)
		.then(function() {
			$http.delete('/tests/id/' + id)
			.success(function(data, status, headers, config){						
				if (data == 'test removed'){
					$mdToast.show($mdToast.simple()
					.textContent('Avaliação removida com sucesso')
					.position('bottom left')
					.hideDelay(3000));
				}
				else{
					$mdToast.show($mdToast.simple()	        				
					.textContent('Erro ao remover avaliação')
					.position('bottom left')
					.hideDelay(3000));	
				}
				$scope.refreshList();
			});					
		}, function() {});
	}
});

//Fim do controlador

var testDialogController = function($scope, $mdDialog, $http, $mdToast, $mdMedia, test) {
	$scope.useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
	$scope.test = angular.copy(test);
	if($scope.test == ''){
		//Cria um objeto test caso venha um string
		$scope.test = new Object();		
		$scope.test.date = new Date();		
		$scope.test.selectedCategories = new Array();
		$scope.test.selectedQuestions = new Array();
		$scope.test.type = 1;
	}
	else{
		$scope.test.date = new Date($scope.test.date);
		$scope.test.selectedCategories = $scope.test.categories;
		$scope.test.selectedQuestions = $scope.test.questions;
		$scope.test.type = $scope.test.type;
	}

	$scope.refreshList = function(filter){
		$http.get('/categories/search')
		.then(function(res){
			$scope.categories = res.data;
		},
		function(res){
			$scope.categories = [];
		});
		$http.get('/questions/search')
		.then(function(res){
			$scope.questions = res.data;			
		},
		function(res){
			$scope.questions = [];
		});
	};

	//Get initial list data
	$scope.refreshList('');

	$scope.cancel = function() {
		$mdDialog.cancel();		
	};

	$scope.saveTest = function(event, id){	
		//POST
		if(!id){
			console.log($scope.test);	
			$http({
				method: 'POST',
				url: './tests',				
				data: $scope.test
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(event);					
				if (data == 'test saved'){						
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
				url: './tests/id/'+ $scope.test._id,				
				data: $scope.test
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(event);					
				if (data == 'test saved'){						
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

	$scope.addCategoryToTest = function(category){
		category = angular.copy(category);		
		$scope.test.selectedCategories.push(category);
	};
	$scope.removeCategoryFromTest = function(category){		
		var index = $scope.test.selectedCategories.indexOf(category);
		if(index > -1){
			$scope.test.selectedCategories.splice(index, 1);
		}
	};
	$scope.upCategory = function(category){
		var index = $scope.test.selectedCategories.indexOf(category);
		//Primeiro elemento não troca
		if(index > 0){
			var t = $scope.test.selectedCategories[index-1];
			$scope.test.selectedCategories[index-1] = $scope.test.selectedCategories[index];
			$scope.test.selectedCategories[index] = t;
		}
	}
	$scope.downCategory = function(category){
		var index = $scope.test.selectedCategories.indexOf(category);
		//Primeiro elemento não troca
		if(index < $scope.test.selectedCategories.length-1){
			var t = $scope.test.selectedCategories[index+1];
			$scope.test.selectedCategories[index+1] = $scope.test.selectedCategories[index];
			$scope.test.selectedCategories[index] = t;
		}
	}
	$scope.addQuestionToTest = function(question){
		question = angular.copy(question);		
		$scope.test.selectedQuestions.push(question);
	};
	$scope.removeQuestionFromTest = function(question){		
		var index = $scope.test.selectedQuestions.indexOf(question);
		if(index > -1){
			$scope.test.selectedQuestions.splice(index, 1);
		}
	};
	$scope.upQuestion = function(question){
		var index = $scope.test.selectedQuestions.indexOf(question);
		//Primeiro elemento não troca
		if(index > 0){
			var t = $scope.test.selectedQuestions[index-1];
			$scope.test.selectedQuestions[index-1] = $scope.test.selectedQuestions[index];
			$scope.test.selectedQuestions[index] = t;
		}
	}
	$scope.downQuestion = function(question){
		var index = $scope.test.selectedQuestions.indexOf(question);
		//Primeiro elemento não troca
		if(index < $scope.test.selectedQuestions.length-1){
			var t = $scope.test.selectedQuestions[index+1];
			$scope.test.selectedQuestions[index+1] = $scope.test.selectedQuestions[index];
			$scope.test.selectedQuestions[index] = t;
		}
	}
}		