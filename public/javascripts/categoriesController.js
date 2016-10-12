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

	$scope.openDialogCategory = function(ev, cat, cats){
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));				
		$mdDialog.show({
			controller: categoryDialogController,
			templateUrl: './categoryDialog.html',
			parent: angular.element(document.body),
			locals: {
				category: cat,
				categories: cats
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

var categoryDialogController = function($scope, $mdDialog, $http, $mdToast, category, categories) {		
	$scope.category = angular.copy(category);
	$scope.categories = angular.copy(categories);

	var toRemove = new Array();
	if (category != ''){
		//Remover a categoria propria categoria para evitar autoreferencia infinita	
		for (var i = 0; i < categories.length; i++) {
			if (categories[i]._id.toString() == category._id.toString()){
				$scope.categories.splice(i, 1);
				break;
			}
		}	
		//Evitar adição a subcategoria propria	
		//Pegar as subcategorias para remover		
		for (var i = 0; i < category.subCategories.length; i++) {
			for (var j = 0; j < categories.length; j++) {			
				if (category.subCategories[i]._id.toString() == categories[j].toString()){				
					for (var k = 0; k < category.subCategories[i]._id.subCategories.length; k++) {					
						toRemove.push(category.subCategories[i].subCategories[k]._id);					
					};				
					toRemove.push(category.subCategories[i]._id._id);
					break;
				}
			}
		}
	}	
	//Categorias folha (altura 3) não podem ter categorias penduradas
	for (var i = 0; i < categories.length; i++) {		
		for (var j = 0; j < categories[i].subCategories.length; j++) {
			for (var k = 0; k < categories[i].subCategories[j].subCategories.length; k++) {					
				toRemove.push(categories[i].subCategories[j].subCategories[k]._id);
			};			
		}
	}
	//Gerar array sem as subcategorias próprias
	var tempCategories = new Array();
	for (var i = 0; i < $scope.categories.length; i++) {
		var found = false;
		for (var j = 0; j < toRemove.length; j++) {			
			if($scope.categories[i]._id.toString() == toRemove[j]){
				found = true;				
				break;
			}
		}
		if(!found)
			tempCategories.push($scope.categories[i]);
	}
	$scope.categories = tempCategories;

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