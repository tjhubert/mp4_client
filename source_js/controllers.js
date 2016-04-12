var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('FirstController', ['$scope', 'CommonData'  , function($scope, CommonData) {
  $scope.data = "";
   $scope.displayText = ""

  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  };

}]);

mp4Controllers.controller('SecondController', ['$scope', 'CommonData' , function($scope, CommonData) {
  $scope.data = "";

  $scope.getData = function(){
    $scope.data = CommonData.getData();

  };

}]);


mp4Controllers.controller('UserListController', ['$scope', '$http', 'Users', '$window' , function($scope, $http, Users, $window) {

  $scope.shouldShowUserForm = false;

  function getAllUsers() {
    Users.getAll().success(function (res){
      $scope.users = res.data;
    });
  }

  $scope.tryDeleteUser = function (user_name, user_id) {
      var confirmDelete = confirm('Are you sure you want to delete user ' + user_name + '?');
      if (confirmDelete) {
        Users.delete(user_id).success(function (res){
          getAllUsers();
        });
      }
  }

  $scope.tryAddUser = function() {
      console.log("try add");
  }

  $scope.toggleUserForm = function() {
    $scope.shouldShowUserForm = !$scope.shouldShowUserForm;
  }

  function init() {
    getAllUsers();
  }

  init();

}]);

mp4Controllers.controller('UserEditController', ['$scope', '$http', 'Users', '$window' , function($scope, $http, Users, $window) {

  // $scope.tryDeleteUser = function (user_name, user_id) {
  //     var confirmDelete = confirm('Are you sure you want to delete user ' + user_name + '?');
  //     if (confirmDelete) {
  //       Users.delete(user_id).success(function (res){
  //         getAllUsers();
  //       });
  //     }
  // }

  // $scope.tryAddUser = function() {
  //     console.log("try add");
  // }

  // $scope.toggleUserForm = function() {
  //   $scope.shouldShowUserForm = !$scope.shouldShowUserForm;
  // }

  // function init() {
  //   getAllUsers();
  // }

  // init();

}]);

mp4Controllers.controller('TaskListController', ['$scope', '$http', 'Tasks', '$window' , function($scope, $http, Tasks, $window) {

  var defaultLimit = 10;
  var defaultSkip = 0;
  var queryParams = {
    limit: defaultLimit,
    skip: defaultSkip
  }
  var taskCount = 0;

  $scope.sorts = [{ name: "Name", value: "name"},
                  { name: "Username", value: "assignedUserName"},
                  { name: "Date Created", value: "dateCreated" },
                  { name: "Deadline", value: "deadline" }];
  $scope.sortBy = $scope.sorts[0];
  $scope.sortOrder = "1";
  $scope.taskStatus = "false";

  $scope.updateTasks = function (shouldResetLimitAndSkip) {
    shouldResetLimitAndSkip = typeof shouldResetLimitAndSkip === 'undefined' ? true : shouldResetLimitAndSkip;
    if ($scope.taskStatus !== "all") {
        queryParams.where = "{\"completed\":" + $scope.taskStatus + "}";
    } else {
        queryParams.where = "";
    }
    queryParams.sort = "{\"" + $scope.sortBy.value + "\":" + $scope.sortOrder + "}";

    if (shouldResetLimitAndSkip) {
      queryParams.limit = defaultLimit;
      queryParams.skip = defaultSkip;
    }

    getAllTasks();
  }

  $scope.nextPage = function() {
    queryParams.skip += 10;
    $scope.updateTasks(false);
    updateShowPaginationButtons();
  }

  function updateShowPaginationButtons() {
    $scope.shouldShowPreviousButton = queryParams.skip >= queryParams.limit ? true : false;
    $scope.shouldShowNextButton = queryParams.skip < taskCount - queryParams.limit ? true : false;
  }

  $scope.previousPage = function() {
    queryParams.skip -= 10;
    $scope.updateTasks(false);
    updateShowPaginationButtons();

  }

  function getAllTasks() {
    Tasks.getAll(queryParamsMaker(false)).success(function (res){
      $scope.tasks = res.data;
    });

    Tasks.getAll(queryParamsMaker(true)).success(function (res){
      taskCount = parseInt(res.data, 10);
      updateShowPaginationButtons();
    });
  }

  $scope.getFormattedDate = function (inputDate) {
    var date = new Date(inputDate);

    var month = date.getMonth() + 1;
    var day = date.getDate();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;

    var str = day + "/" + month + "/" + date.getFullYear();

    return str;
}

  $scope.tryDeleteTask = function (task_name, task_id) {
      var confirmDelete = confirm('Are you sure you want to delete task "' + task_name + '"?');
      if (confirmDelete) {
        Tasks.delete(task_id).success(function (res){
          getAllTasks();
        });
      }
  }

  $scope.tryAddTask = function() {
      console.log("try add");
  }

  $scope.toggleTaskForm = function() {
    $scope.shouldShowTaskForm = !$scope.shouldShowTaskForm;
  }

  function queryParamsMaker(isCount) {
    var queries = [];
    for (var key in queryParams) {
      if (queryParams.hasOwnProperty(key) && queryParams[key]) {
        if ( !isCount || (key !== "limit" && key !== "skip") ) {
          queries.push(key + "=" + queryParams[key]);
        }
      }
    }

    if (isCount) {
      queries.push("count=true");
    }

    return "?" + queries.join("&");
  }

  function init() {
    $scope.updateTasks();
    updateShowPaginationButtons();
  }

  init();

}]);

mp4Controllers.controller('SettingsController', ['$scope' , '$window' , function($scope, $window) {
  $scope.url = $window.sessionStorage.baseurl;

  $scope.setUrl = function(){
    $window.sessionStorage.baseurl = $scope.url;
    $scope.displayText = "URL set";

  };

}]);
