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
	$scope.test = angular.copy(test);
	$scope.useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
	
	if($scope.test == ''){
		//Cria um objeto test caso venha um string
		$scope.test = {};
		$scope.test.questions = [];
		$scope.test.date = new Date();
	}
	else{		
		$scope.test.date = new Date($scope.test.date);
	}

	$scope.refreshList = function(filter){
		$http.get('/questions/search')
		.then(function(res){
			$scope.questions = res.data;
			console.log($scope.test);
			console.log($scope.questions);
			//Setting all questions false for undefined field adjustment
			for(var j = 0; j < $scope.questions.length; j++){
				$scope.questions[j].selected = false;
			}
			//Verifies which questions are selected
			for(var i = 0; i < $scope.test.questions.length; i++){				
				for(var j = 0; j < $scope.questions.length; j++){					
					if($scope.questions[j]._id == $scope.test.questions[i].id){
						$scope.questions[j].selected = true;
						$scope.questions[j].priority = $scope.test.questions[i].priority;
					}
				}
			}
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
		if(!id){
			//Populate with selected students			
			$scope.test.questions = [];
			for (var i = 0; i < $scope.questions.length; i++) {
				if($scope.questions[i].selected){
					var obj = {};
					obj.priority = $scope.questions[i].priority;
					obj.id = $scope.questions[i]._id;
					$scope.test.questions.push(obj);
				}		
			};		
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
			//Populate with selected students			
			$scope.test.questions = [];
			for (var i = 0; i < $scope.questions.length; i++) {
				if($scope.questions[i].selected){
					var obj = {};
					obj.priority = $scope.questions[i].priority;
					obj.id = $scope.questions[i]._id;
					$scope.test.questions.push(obj);
				}		
			};					
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
}		