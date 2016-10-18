/* Controller */
app.controller("reportController", function ($scope, $http, $mdDialog, $mdMedia, $mdToast, appData) {

	appData.activity = "Relatórios";
	$scope.$emit('refresh', appData);

	$scope.refreshList = function () {
		$http.get('/tests/search')
			.then(function (res) {
				$scope.tests = res.data;
			},
			function (res) {
				$scope.tests = [];
			});
	}

	//carregando dados
	$scope.refreshList();

	$scope.openDialogReport = function (ev, q) {
		$mdDialog.show({
			controller: reportDialogController,
			templateUrl: './reportDialog.html',
			parent: angular.element(document.body),
			locals: {
				test: q
			},
			targetEvent: ev,
			clickOutsideToClose: true,
			fullscreen: true			
		})
			.then(function (event) {
				$scope.refreshList();
			},
			function () { }
			);
	}
});


var reportDialogController = function ($scope, $mdDialog, $http, $mdToast, $mdMedia, test) {
	$scope.useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
	$scope.test = angular.copy(test);
	$scope.test.date = new Date($scope.test.date);

	$scope.refreshList = function (filter) {
		$http.get('/classes/search')
			.then(function (res) {
				$scope.classes = res.data;
			},
			function (res) {
				$scope.classes = [];
			});
	};

	//Get initial list data
	$scope.refreshList('');

	$scope.cancel = function () {
		$mdDialog.cancel();
	};

	$scope.saveTest = function (event, id) {
		//POST
		if (!id) {
			console.log($scope.test);
			$http({
				method: 'POST',
				url: './tests',
				data: $scope.test
			})
				.success(function (data, status, headers, config) {
					$mdDialog.hide(event);
					if (data == 'test saved') {
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
				url: './tests/id/' + $scope.test._id,
				data: $scope.test
			})
				.success(function (data, status, headers, config) {
					$mdDialog.hide(event);
					if (data == 'test saved') {
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