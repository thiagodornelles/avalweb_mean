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
			// targetEvent: ev,
			clickOutsideToClose: true,
			fullscreen: true,
			skipHide: true
		})
			.then(function (event) {
				$scope.refreshList();
			},
			function () { }
			);
	}
});

var reportTestDialogController = function ($scope, $http, $mdDialog, test) {

	$scope.cancel = function () {
		$mdDialog.cancel();
	};
	$scope.answeredQuestions = test.answeredQuestions;
	$scope.answers = test.answers;
	for (var i = 0; i < $scope.answeredQuestions.length; i++) {
		var question = $scope.answeredQuestions[i];
		var answer = $scope.answers[i];
		for (var j = 0; j < question.answers.length; j++) {
			if (question.answers[j]._id.toString() === answer) {
				question.answers[j].studentAnswer = true;
				break;
			}
		}
	}
}


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
		$http.get('/reports/studentswithscore/' + test._id)
			.then(function (res) {
				$scope.studentTests = res.data;
			},
			function (res) {
				$scope.studentTests = [];
			});
	};

	$scope.openDialogReportTest = function (ev, t) {
		$mdDialog.show({
			controller: reportTestDialogController,
			templateUrl: './reportTestDialog.html',
			parent: angular.element(document.body),
			locals: {
				test: t
			},
			openFrom: angular.element(document.body),
			clickOutsideToClose: false,
			fullscreen: true,
			skipHide: true,

		});
	}

	//Get initial list data
	$scope.refreshList('');

	$scope.cancel = function () {
		$mdDialog.cancel();
	};
}		