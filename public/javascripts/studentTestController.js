/* Controller */
app.controller("studentTestController", function ($scope, $http, $mdDialog, $mdMedia, $mdToast, appData) {

	appData.activity = "Avaliações";
	$scope.$emit('refresh', appData);

	$scope.refreshList = function () {
		$http.get('/studenttests/search')
			.then(function (res) {
				$scope.tests = res.data;
			},
			function (res) {
				$scope.tests = [];
			});
	}

	//carregando dados
	$scope.refreshList();

	$scope.openDialogStudentTest = function (ev, q) {
		$mdDialog.show({
			controller: testDialogController,
			templateUrl: './studentTestDialog.html',
			parent: angular.element(document.body),
			locals: {
				test: q
			},
			targetEvent: ev,
			clickOutsideToClose: false,
			fullscreen: true,
			openFrom: '#fab_add_test',
			closeTo: '#fab_add_test'
		})
			.then(function (event) {
				$scope.refreshList();
			},
			function () { }
			);
	};
});

//Fim do controlador

var testDialogController = function ($scope, $mdDialog, $http, test) {
	$scope.test = angular.copy(test);
	$scope.question = {};
	$scope.questionChecked = false;

	//consulta se já fez a prova
	$scope.finished = function () {
		$http.get('/studenttests/finishedtest/' + test._id)
			.success(function (response, status) {
				if (response == 'test finished') {
					$scope.form = 'reportForm';
				}
				else {
					$scope.form = 'startForm';
				}
			});
	};

	$scope.finished();

	$scope.cancel = function () {
		$mdDialog.cancel();
	};

	$scope.cancelConfirm = function () {
		var confirm = $mdDialog.confirm()
			.title('Desistir da avaliação?')
			.textContent('Se você fechar a avaliação não poderá fazê-la novamente, ficando sem nota')
			.ariaLabel('Desistir da avaliação')						
			.cancel('Desistir')
			.ok('Continuar avaliação');
		confirm._options.skipHide = true;
		$mdDialog.show(confirm)
		.then(function () {
		}, function () {
			$mdDialog.cancel();
		});
	};

	$scope.startTest = function () {
		$scope.startedTest = true;
		$http.post('/studenttests/starttest', $scope.test)
			.success(function (response, status) {
				if (response) {
					$scope.form = '5AnswerQuestion';
					$scope.question = response;
				}
			});
	};

	$scope.checkQuestion = function (answer_id, question_id) {
		$scope.test.answer_id = answer_id;
		$scope.test.question_id = question_id;
		if (answer_id) {
			$scope.questionChecked = true;
			$http.post('/studenttests/checkquestion', $scope.test)
				.success(function (response, status) {
					//Preenche com a questão com respostas e feedbacks
					if (response) {
						var temp = $scope.question;
						$scope.question = response;
						$scope.question.answer = temp.answer;
						$scope.question.disableControls = true;
					}
				});
		}
	};

	$scope.nextQuestion = function (answer_id) {
		$scope.test.answer_id = answer_id;
		if (answer_id) {
			// console.log(answer_id);
			$http.post('/studenttests/nextquestion', $scope.test)
				.success(function (response, status) {
					if (response == 'end of test') {
						$scope.startedTest = false;
						$scope.form = response;
					}
					else if (response) {
						$scope.form = '5AnswerQuestion';
						$scope.question = response;
					}
				});
		}
		$scope.questionChecked = false;;
	};

	$scope.saveTest = function (event, id) {
		if (!id) {
			//Populate with selected students			
			$scope.test.questions = [];
			for (var i = 0; i < $scope.questions.length; i++) {
				if ($scope.questions[i].selected) {
					$scope.test.questions.push($scope.questions[i]._id);
				}
			};
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
			//Populate with selected students			
			$scope.test.questions = [];
			for (var i = 0; i < $scope.questions.length; i++) {
				if ($scope.questions[i].selected) {
					$scope.test.questions.push($scope.questions[i]._id);
				}
			};
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