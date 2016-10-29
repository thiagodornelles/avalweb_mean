/* Controller */
app.controller("categoryController", function ($scope, $http, $mdDialog, $mdMedia, $mdToast, appData) {

	appData.activity = "Categorias";
	$scope.$emit('refresh', appData);

	$scope.refreshList = function () {
		$http.get('/categories/search')
			.then(function (res) {
				$scope.categories = res.data;
			},
			function (res) {
				$scope.categories = [];
			});
	}

	//carregando dados
	$scope.refreshList();

	$scope.openDialogCategory = function (ev, cat, cats) {
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
			.then(function (answer) {
				$scope.refreshList();
			},
			function () { }
			);
	}

	$scope.removeCategory = function (ev, id) {
		var confirm = $mdDialog.confirm()
			.title('Remover?')
			.textContent('Tem certeza que deseja remover esta categoria?')
			.targetEvent(ev)
			.ok('Sim, remover')
			.cancel('Cancelar');

		$mdDialog.show(confirm)
			.then(function () {
				$http.delete('/categories/id/' + id)
					.success(function (data, status, headers, config) {
						if (data == 'category removed') {
							$mdToast.show($mdToast.simple()
								.textContent('Categoria removida com sucesso')
								.position('bottom left')
								.hideDelay(3000));
						}
						else {
							$mdToast.show($mdToast.simple()
								.textContent('Erro ao remover categoria')
								.position('bottom left')
								.hideDelay(3000));
						}
						$scope.refreshList();
					});
			}, function () { });
	}
});

//Fim do controlador

var categoryDialogController = function ($scope, $mdDialog, $http, $mdToast, category, categories) {
	$scope.category = angular.copy(category);
	$scope.categories = angular.copy(categories);
	$scope.catsTree = new Array();

	for (i = 0; i < $scope.categories.length; i++) {
		var cat = $scope.categories[i];
		if (!cat.superCategory) {
			if (indexOf_Id($scope.catsTree, cat._id) == -1) {
				$scope.catsTree.push(cat);
			}
			for (j = 0; j < cat.subCategories.length; j++) {
				var subcat = cat.subCategories[j];
				subcat.name = "― " + subcat.name;
				if (indexOf_Id($scope.catsTree, subcat._id) == -1) {
					$scope.catsTree.push(subcat);
				}
				for (k = 0; k < subcat.subCategories.length; k++) {
					var subsubcat = subcat.subCategories[k];
					subsubcat.name = "―― " + subsubcat.name;
					if (indexOf_Id($scope.catsTree, subsubcat._id) == -1) {
						$scope.catsTree.push(subsubcat);
					}
				}
			}
		}
	}
	
	$scope.cancel = function () {
		$mdDialog.cancel();
	};
	$scope.saveCategory = function (answer, id) {
		if (!id) {
			$http({
				method: 'POST',
				url: './categories',
				data: $scope.category
			})
				.success(function (data, status, headers, config) {
					$mdDialog.hide(answer);
					if (data == 'category saved') {
						$mdToast.show($mdToast.simple()
							.textContent('Dados salvos com sucesso')
							.position('bottom left')
							.hideDelay(3000));
					}
					else {
						$mdToast.show($mdToast.simple()
							.textContent('Dados não foram salvos')
							.position('bottom left')
							.hideDelay(3000));
					}
				});
		}
		else {
			$http({
				method: 'PUT',
				url: './categories/id/' + $scope.category._id,
				data: $scope.category
			})
				.success(function (data, status, headers, config) {
					$mdDialog.hide(answer);
					if (data == 'category saved') {
						$mdToast.show($mdToast.simple()
							.textContent('Dados salvos com sucesso')
							.position('bottom left')
							.hideDelay(3000));
					}
					else {
						$mdToast.show($mdToast.simple()
							.textContent('Dados não foram salvos')
							.position('bottom left')
							.hideDelay(3000));
					}
				});
		}
	};
}		