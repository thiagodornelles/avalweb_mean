/* Controller */
app.controller("classController", function($scope, $http, $mdDialog, $mdMedia, $mdToast, appData) {
	
	appData.activity = "Turmas";
	$scope.$emit('refresh', appData);	

	$scope.refreshList = function(){
		$http.get('/classes/search')
		.then(function(res){
			$scope.classes = res.data;			
		},
		function(res){
			$scope.classes = [];				
		});		
	}

	//carregando dados
	$scope.refreshList();	

	$scope.openDialogClass = function(ev, q){
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
		$mdDialog.show({
			controller: classDialogController,
			templateUrl: './classDialog.html',
			parent: angular.element(document.body),
			locals:{
				clas: q
			},
			targetEvent: ev,					
			clickOutsideToClose: true,
			fullscreen: true,
			openFrom: '#fab_add_class',
			closeTo: '#fab_add_class'
		})				
		.then(function(event) {
			$scope.refreshList();				
		},
		function() {}
		);
	}

	$scope.removeClass = function(ev, id){				
		var confirm = $mdDialog.confirm()
		.title('Remover?')
		.textContent('Tem certeza que deseja remover esta turma?')
		.targetEvent(ev)		
		.ok('Sim, remover')
		.cancel('Cancelar');

		$mdDialog.show(confirm)
		.then(function() {
			$http.delete('/classes/id/' + id)
			.success(function(data, status, headers, config){						
				if (data == 'class removed'){
					$mdToast.show($mdToast.simple()
					.textContent('Turma removida com sucesso')
					.position('bottom left')
					.hideDelay(3000));			
				}
				else{
					$mdToast.show($mdToast.simple()	        				
					.textContent('Erro ao remover Turma')
					.position('bottom left')
					.hideDelay(3000));	
				}
				$scope.refreshList();
			});					
		}, function() {});
	}
});

//Fim do controlador

var classDialogController = function($scope, $mdDialog, $http, $mdToast, $mdMedia, clas) {	

	$scope.clas = angular.copy(clas);
	if($scope.clas == ''){
		//Cria um objeto clas caso venha um string
		$scope.clas = {};
		$scope.clas.students = [];
	}
	$scope.useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));

	$scope.refreshList = function(filter){
		//Get students list	which are enrolled
		$http.get('/students/search')
		.then(function(res){
			$scope.students = res.data;				
			for(var i = 0; i < $scope.clas.students.length; i++){
				for(var j = 0; j < $scope.students.length; j++){			
					if($scope.students[j]._id == $scope.clas.students[i]){
						$scope.students[j].selected = true;					
					}
				}
			}
		},
		function(res){
			$scope.students = [];				
		});
	}

	//Get data
	$scope.refreshList('');

	$scope.cancel = function() {
		$mdDialog.cancel();
	};			
	$scope.saveClass = function(event, id){		
		if(!id){
			//Populate with selected students			
			$scope.clas.students = [];
			for (var i = 0; i < $scope.students.length; i++) {
				if($scope.students[i].selected){
					$scope.clas.students.push($scope.students[i]._id);					
					// console.log($scope.students[i]);
				}		
			};
			$http({
				method: 'POST',
				url: './classes',				
				data: $scope.clas
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(event);					
				if (data == 'class saved'){						
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
			$scope.clas.students = [];
			for (var i = 0; i < $scope.students.length; i++) {
				if($scope.students[i].selected){
					$scope.clas.students.push($scope.students[i]._id);					
					// console.log($scope.students[i]);
				}		
			};
			$http({
				method: 'PUT',
				url: './classes/id/'+ $scope.clas._id,				
				data: $scope.clas
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(event);					
				if (data == 'class saved'){						
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