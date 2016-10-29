/* Controller */
app.controller("questionController", function ($scope, $http, $mdDialog, $mdMedia, $mdToast, appData) {

	appData.activity = "Questões";
	$scope.$emit('refresh', appData);
	$scope.uploadOK = 0;

	$scope.refreshList = function () {
		$http.get('/questions/search')
			.then(function (res) {
				$scope.questions = res.data;
				$http.get('/categories/search')
					.then(function (res) {
						$scope.categories = res.data;
					},
					function (res) {
						$scope.categories = [];
					});
			},
			function (res) {
				$scope.questions = [];
			});
	}

	//carregando dados
	$scope.refreshList();

	$scope.openDialogQuestion = function (ev, q, cats) {
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
		$mdDialog.show({
			controller: questionDialogController,
			templateUrl: './questionDialog.html',
			parent: angular.element(document.body),
			locals: {
				question: q,
				categories: cats
			},
			targetEvent: ev,
			clickOutsideToClose: true,
			fullscreen: true,
			openFrom: '#fab_add_question',
			closeTo: '#fab_add_question'
		})
			.then(function (answer) {
				$scope.refreshList();
			},
			function () { }
			);
	}

	$scope.removeQuestion = function (ev, id) {
		var confirm = $mdDialog.confirm()
			.title('Remover?')
			.textContent('Tem certeza que deseja remover esta questão?')
			.targetEvent(ev)
			.ok('Sim, remover')
			.cancel('Cancelar');

		$mdDialog.show(confirm)
			.then(function () {
				$http.delete('/questions/id/' + id)
					.success(function (data, status, headers, config) {
						if (data == 'question removed') {
							$mdToast.show($mdToast.simple()
								.textContent('Questão removida com sucesso')
								.position('bottom left')
								.hideDelay(3000));
						}
						else {
							$mdToast.show($mdToast.simple()
								.textContent('Erro ao remover questão')
								.position('bottom left')
								.hideDelay(3000));
						}
						$scope.refreshList();
					});
			}, function () { });
	}
});

//Fim do controlador

var questionDialogController = function ($scope, $mdDialog, $http, $mdToast, question, categories) {
	$scope.question = angular.copy(question);
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

	$scope.postOrPutQuestion = function (result, answer, id) {
		$scope.uploadOK = 1;
		$scope.question.imagePath = result;

		if (!id) {
			$http({
				method: 'POST',
				url: './questions',
				data: $scope.question
			})
				.success(function (data, status, headers, config) {
					$mdDialog.hide(answer);
					if (data == 'question saved') {
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
				url: './questions/id/' + $scope.question._id,
				data: $scope.question
			})
				.success(function (data, status, headers, config) {
					$mdDialog.hide(answer);
					if (data == 'question saved') {
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

	$scope.saveQuestion = function (answer, id) {
		//Enviando imagem
		if ($scope.files.length > 0) {
			var formData = new FormData();
			angular.forEach($scope.files, function (obj) {
				formData.append('files[]', obj.lfFile);
			});
			$http.post('./questions/upload', formData, {
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined }
			})
				.then(
				function (result) {
					$scope.postOrPutQuestion(result, answer, id);
				},
				function (err) {
					$scope.uploadOK = 2;
				}
				);
		}
		else if (id) {
			$scope.postOrPutQuestion($scope.question.imagePath, answer, id);
		}
		else {
			$scope.postOrPutQuestion('', answer, id);
		}
	};

	$scope.upload = function () {
		var formData = new FormData();
		angular.forEach($scope.files, function (obj) {
			formData.append('files[]', obj.lfFile);
		});
		$http.post('./questions/upload', formData, {
			transformRequest: angular.identity,
			headers: { 'Content-Type': undefined }
		}).then(function (result) {
			$scope.uploadOK = 1;
		}, function (err) {
			$scope.uploadOK = 2;
		});
	};
}		