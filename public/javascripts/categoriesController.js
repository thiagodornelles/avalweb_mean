/* Controller */
app.controller("categoryController", function($scope, $http, $mdDialog, $mdMedia, $mdToast, appData) {
	
	appData.activity = "Categorias";
	$scope.$emit('refresh', appData);

	$scope.refreshList = function(){
		$http.get('/categories/search')
		.then(function(res){
			$scope.categories = res.data;					
		},
		function(res){
			$scope.categories = [];				
		});		
	}

	//carregando dados
	$scope.refreshList();

	$scope.openDialogCategory = function(ev, q){				
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));				
		$mdDialog.show({
			controller: categoryDialogController,
			templateUrl: './categoryDialog.html',
			parent: angular.element(document.body),
			locals:{
				category: q
			},
			targetEvent: ev,					
			clickOutsideToClose: true,
			fullscreen: true,
			openFrom: '#fab_add_category',
			closeTo: '#fab_add_category'
		})				
		.then(function(answer) {
			$scope.refreshList();					
		},
		function() {}
		);
	}

	$scope.removeCategory = function(ev, id){				
		var confirm = $mdDialog.confirm()
		.title('Remover?')
		.textContent('Tem certeza que deseja remover esta categoria?')
		.targetEvent(ev)		
		.ok('Sim, remover')
		.cancel('Cancelar');

		$mdDialog.show(confirm)
		.then(function() {
			$http.delete('/categories/id/' + id)
			.success(function(data, status, headers, config){						
				if (data == 'category removed'){
					$mdToast.show($mdToast.simple()
					.textContent('Categoria removida com sucesso')
					.position('bottom left')
					.hideDelay(3000));			
				}
				else{
					$mdToast.show($mdToast.simple()	        				
					.textContent('Erro ao remover categoria')
					.position('bottom left')
					.hideDelay(3000));	
				}
				$scope.refreshList();
			});					
		}, function() {});
	}	
});

//Fim do controlador

var categoryDialogController = function($scope, $mdDialog, $http, $mdToast, category) {		
	$scope.category = angular.copy(category);	

	$scope.cancel = function() {
		$mdDialog.cancel();
	};			
	$scope.saveCategory = function(answer, id){				
		if(!id){				
			$http({
				method: 'POST',
				url: './categories',
				data: $scope.category
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(answer);					
				if (data == 'category saved'){						
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
				url: './categories/id/'+ $scope.category._id,				
				data: $scope.category
				})
			.success(function(data, status, headers, config){
				$mdDialog.hide(answer);					
				if (data == 'category saved'){						
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