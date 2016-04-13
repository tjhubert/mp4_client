var mp4Controllers = angular.module('mp4Controllers', []);


mp4Controllers.controller('UserListController', ['$scope', '$http', 'Users', 'Tasks', '$window', '$location', function($scope, $http, Users, Tasks, $window, $location) {

  $scope.shouldShowUserForm = false;

  function getAllUsers() {
    Users.getAll('?select={"name": 1, "email": 1}').success(function (res){
      $scope.users = res.data;
    });
  }

  $scope.goUserDetailsPage = function (user_id) {
    $location.url('/userdetails/' + user_id);
  }

  $scope.tryDeleteUser = function (user_name, user_id) {
      var confirmDelete = confirm('Are you sure you want to delete user ' + user_name + '?');
      if (confirmDelete) {
        Users.delete(user_id).success(function (res){
          getAllUsers();
        });

        Tasks.getAll('?where={"assignedUser":"' + user_id + '"}').success(function (res){
          res.data.forEach(function (task) {
            task.assignedUser = "";
            task.assignedUserName = "unassigned";
            Tasks.put(task._id, task)
            .success( function (res) {
              console.log("Success updating associated tasks");
            })
            .error( function (res) {
              console.log(res);
            })
          })
        });

      }
  }

  $scope.goAddUserPage = function() {
    $location.url("/usernew");
  }

  $scope.toggleUserForm = function() {
    $scope.shouldShowUserForm = !$scope.shouldShowUserForm;
  }

  function init() {
    getAllUsers();
  }

  init();

}]);

mp4Controllers.controller('UserDetailsController', ['$scope', '$http', 'UserDetails', '$routeParams', '$location', function($scope, $http, UserDetails, $routeParams, $location) {

  $scope.currentUser = {};
  $scope.pendingTasks = [];
  $scope.completedTasks = [];
  $scope.showCompletedTasksButtonClicked = false;
  var user_id = $routeParams.user_id;

  function initCurrentUser() {
    UserDetails.getUser(user_id).success(function (res){
      $scope.currentUser = res.data;
      updatePendingTasks();
    });
  }

  function updatePendingTasks() {
    $scope.pendingTasks = [];
    $scope.currentUser.pendingTasks.forEach( function (task_id) {
        UserDetails.getPendingTask(task_id).success( function (res) {
          $scope.pendingTasks.push(res.data);
        });
    });
  }

  function updateCompletedTasks() {
    $scope.completedTasks = [];
    UserDetails.getCompletedTasks('?where={"assignedUser":"' + user_id + '","completed":true}')
    .success( function (res) {
      $scope.completedTasks = res.data;
    })
    .error( function (res) {
      $scope.completedTasks = [];
      console.log(res);
    });
  }

  $scope.goTaskDetailsPage = function (task_id) {
    $location.url('/taskdetails/' + task_id);
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

  $scope.markTaskAsCompleted = function (task) {
    var userPendingTasks = $scope.currentUser.pendingTasks;

    if (_.isArray(userPendingTasks)) {
      $scope.currentUser.pendingTasks = _.without(userPendingTasks, _.findWhere(userPendingTasks, task._id));
    } else if ($scope.currentUser.pendingTasks === task._id) {
      $scope.currentUser.pendingTasks = [];
    }

    task.completed = true;
    
    UserDetails.putUser(user_id, $scope.currentUser)
    .success( function (res) {
      updatePendingTasks();
    })
    .error( function (res) {
      console.log(res);
    });

    UserDetails.putCompletedTask(task._id, task)
    .success( function (res) {
      $scope.getCompletedTasks();
    })
    .error( function (res) {
      console.log(res);
    });
  }

  $scope.getCompletedTasks = function () {
    $scope.showCompletedTasksButtonClicked = true;
    updateCompletedTasks();
  }

  $scope.hideCompletedTasks = function () {
    $scope.showCompletedTasksButtonClicked = false;
    $scope.completedTasks = [];
  }

  function init() {
    initCurrentUser();
  }

  init();

}]);

mp4Controllers.controller('TaskListController', ['$scope', '$http', 'Tasks', 'Users', '$window', '$location', function($scope, $http, Tasks, Users, $window, $location) {

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

  $scope.goTaskDetailsPage = function (task_id) {
    $location.url('/taskdetails/' + task_id);
  }

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

  $scope.tryDeleteTask = function (task) {
      var confirmDelete = confirm('Are you sure you want to delete task "' + task.name + '"?');
      if (confirmDelete) {
        Tasks.delete(task._id).success(function (res){
          getAllTasks();
        });

        if (!task.completed && task.assignedUser) {
          Users.getOne(task.assignedUser)
          .success(function (res) {
            if (_.isArray(res.data.pendingTasks)) {
              res.data.pendingTasks = _.without(res.data.pendingTasks, _.findWhere(res.data.pendingTasks, task._id));
            } else if (res.data.pendingTasks === task._id) {
              res.data.pendingTasks = [];
            }
            Users.put(task.assignedUser, res.data)
            .success( function (res) {
              console.log("Success updating the associated user");
            })
            .error( function (res) {
              console.log(res);
            })
          });
        }

      }
  }

  $scope.goAddTaskPage = function() {
      $location.url("/tasknew");
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

mp4Controllers.controller('TaskDetailsController', ['$scope', '$http', 'Users', 'Tasks', '$routeParams', '$location' , function($scope, $http, Users, Tasks, $routeParams, $location) {

  $scope.currentTask = {};
  var task_id = $routeParams.task_id;

  function initCurrentTask() {
    Tasks.getOne(task_id).success(function (res){
      $scope.currentTask = res.data;
    });
  }

  function changeCurrentTaskStatus(isCompleted) {
    $scope.currentTask.completed = isCompleted;
    Tasks.put(task_id, $scope.currentTask).success(function (res){
      $scope.currentTask = res.data;
    });
    if ($scope.currentTask.assignedUser) {
      Users.getOne($scope.currentTask.assignedUser).success( function (res) {
        var user = res.data;
        if (isCompleted) {
          if (_.isArray(user.pendingTasks)) {
            user.pendingTasks = _.without(user.pendingTasks, _.findWhere(user.pendingTasks, $scope.currentTask._id));
          } else if (user.pendingTasks === task._id) {
            user.pendingTasks = [];
          }
        } else {
          if (_.isArray(user.pendingTasks)) {
            user.pendingTasks.push($scope.currentTask._id);
          } else {
            user.pendingTasks = [$scope.currentTask._id];
          }
        }
        Users.put(user._id, user)
        .success( function (res) {
          console.log("Success updating associated user");
          console.log(res);
        })
        .error( function (res) {
          console.log("Error updating associated user");
          console.log(res);
        })
      });
    }
  }

  $scope.markAsCompleted = function() {
    changeCurrentTaskStatus(true);
  }

  $scope.markAsPending = function() {
    changeCurrentTaskStatus(false);
  }

  $scope.goTaskEditPage = function() {
    $location.url("/taskedit/" + task_id);
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

  function init() {
    initCurrentTask();
  }

  init();

}]);


mp4Controllers.controller('TaskNewController', ['$scope', '$http', 'Tasks', 'Users', '$routeParams' , function($scope, $http, Tasks, Users, $routeParams) {

  var formElem = $("#task-form");
  var formErrorFeedback = $("#form-error-feedback");
  var formSuccessFeedback = $("#form-success-feedback");
  var foundationForm = new Foundation.Abide(formElem, {  liveValidate : true });

  function getAllUsers() {
    Users.getAll().success(function (res){
      $scope.users = res.data;
    });
  }

  formElem.on("submit", function(event) {
    event.preventDefault();
    if (foundationForm.validateForm()) {
      var data = {
        name: $scope.newTaskName,
        deadline: $scope.newTaskDeadline,
        description: $scope.newTaskDescription,
        assignedUser: $scope.newTaskAssignee ? $scope.newTaskAssignee._id : "",
        assignedUserName: $scope.newTaskAssignee ? $scope.newTaskAssignee.name : "unassigned",
        completed: false
      }
      Tasks.post(data)
      .success(function (res) {
        if (_.isArray($scope.newTaskAssignee.pendingTasks)) {
          $scope.newTaskAssignee.pendingTasks.push(res.data._id)
        } else {
          $scope.newTaskAssignee.pendingTasks = [res.data._id]
        }

        Users.put($scope.newTaskAssignee._id, $scope.newTaskAssignee)
        .success( function (res) {
          $scope.addedTask = $scope.newTaskName;
          $scope.newTaskName = "";
          $scope.newTaskDeadline = "";
          $scope.newTaskDescription = "";
          $scope.newTaskAssignee = "";

          formSuccessFeedback.show();
          formErrorFeedback.hide();
          console.log("Success updating associated user");
        })
        .error( function (res) {
          console.log(res);
          console.log("Error updating associated user");
        })
        
      })
      .error(function (res) {
        console.log(res);
        formSuccessFeedback.hide();
        formErrorFeedback.show();
      })
    } else {
      formSuccessFeedback.hide();
    }

  });

  function init() {
    getAllUsers();
  }

  init();

}]);

mp4Controllers.controller('TaskEditController', ['$scope', '$http', 'Tasks', 'Users', '$routeParams' , function($scope, $http, Tasks, Users, $routeParams) {

  var formElem = $("#task-form");
  var formErrorFeedback = $("#form-error-feedback");
  var formSuccessFeedback = $("#form-success-feedback");
  var foundationForm = new Foundation.Abide(formElem, {  liveValidate : true });
  var task_id = $routeParams.task_id;
  var originalTaskAssignee;

  function getAllUsers() {
    Users.getAll().success(function (res){
      $scope.users= [{"_id":"","name":"unassigned"}].concat(res.data);
      Tasks.getOne(task_id).success(function (res){
        $scope.currentTask = res.data;
        $scope.currentTaskAssignee = _.findWhere($scope.users, {"_id":$scope.currentTask.assignedUser})
        originalTaskAssignee = $scope.currentTaskAssignee;
      });
    });
  }

  formElem.on("submit", function(event) {
    event.preventDefault();
    if (foundationForm.validateForm()) {
      var editedTask = $scope.currentTask;

      editedTask.completed = editedTask.completed === "1" ? true : false;
      editedTask.assignedUser = $scope.currentTaskAssignee._id;
      editedTask.assignedUserName = $scope.currentTaskAssignee.name;

      if (!originalTaskAssignee.completed && editedTask.completed || originalTaskAssignee._id !== editedTask.assignedUser) {
        var userPendingTasks = originalTaskAssignee.pendingTasks;

        if (_.isArray(userPendingTasks)) {
          originalTaskAssignee.pendingTasks = _.without(userPendingTasks, _.findWhere(userPendingTasks, editedTask._id));
        } else if ($scope.currentUser.pendingTasks === editedTask._id) {
          originalTaskAssignee.pendingTasks = [];
        }

        Users.put(originalTaskAssignee._id, originalTaskAssignee)
        .success(function (res) {
          console.log("success removing old pending task")
        })
        .error(function (res) {
          console.log(res);
          console.log("error removing old pending task")
        })
      }

      if (!editedTask.completed && originalTaskAssignee._id !== editedTask._id) {
        var userPendingTasks = $scope.currentTaskAssignee.pendingTasks;

        if (_.isArray(userPendingTasks) && !_.contains(userPendingTasks, editedTask._id)) {
          $scope.currentTaskAssignee.pendingTasks.push(editedTask._id);
        } else if ($scope.currentTaskAssignee.pendingTasks !== editedTask._id) {
          $scope.currentTaskAssignee.pendingTasks = [editedTask._id];
        }

        Users.put($scope.currentTaskAssignee._id, $scope.currentTaskAssignee)
        .success(function (res) {
          console.log("success adding new pending task")
          originalTaskAssignee = $scope.currentTaskAssignee;
        })
        .error(function (res) {
          console.log(res);
          console.log("error adding new pending task")
        })
      }

      if (originalTaskAssignee.completed && !editedTask.completed || originalTaskAssignee._id !== editedTask._id) {
        var userPendingTasks = originalTaskAssignee.pendingTasks;

        if (_.isArray(userPendingTasks)) {
          originalTaskAssignee.pendingTasks = _.without(userPendingTasks, _.findWhere(userPendingTasks, editedTask._id));
        } else if ($scope.currentUser.pendingTasks === editedTask._id) {
          originalTaskAssignee.pendingTasks = [];
        }

        Users.put(originalTaskAssignee._id, originalTaskAssignee)
        .success(function (res) {
          console.log("success removing old pending task")
        })
        .error(function (res) {
          console.log(res);
          console.log("error removing old pending task")
        })
      }

      Tasks.put(editedTask._id, editedTask)
      .success(function (res) {
        formSuccessFeedback.show();
        formErrorFeedback.hide();
      })
      .error(function (res) {
        console.log(res);
        formSuccessFeedback.hide();
        formErrorFeedback.show();
      })

    }
  });

  function init() {
    getAllUsers();
  }

  init();

}]);

mp4Controllers.controller('UserNewController', ['$scope', '$http', 'Users', 'Tasks', '$routeParams' , function($scope, $http, Users, Tasks, $routeParams) {


  var formElem = $("#user-form");
  var formEmail = $("#user-email");
  var emailError = $("#user-email-error");
  var formErrorFeedback = $("#form-error-feedback");
  var formSuccessFeedback = $("#form-success-feedback");
  var isDuplicateEmail = false;
  var foundationForm = new Foundation.Abide(formElem, {  liveValidate : true });

  formEmail.keyup( function () {
    if (isDuplicateEmail) {
      emailError.text("Email is required.")
      isDuplicateEmail = false;
    }
  });

  formElem.on("submit", function(event) {
    event.preventDefault();
    if (foundationForm.validateForm()) {
      var data = {
        name: $scope.newUserName,
        email: formEmail.val()
      }
      Users.post(data)
      .success(function (res) {
        $scope.addedUser = $scope.newUserName;
        $scope.newUserName = "";
        formEmail.val("");
        formSuccessFeedback.show();
        formErrorFeedback.hide();
      })
      .error(function (res) {
        emailError.text("Email already exists.");
        isDuplicateEmail = true;
        formSuccessFeedback.hide();
        formErrorFeedback.show();
        foundationForm.addErrorClasses(formEmail);
      })
    } else {
      formSuccessFeedback.hide();
    }

  });

}]);

mp4Controllers.controller('SettingsController', ['$scope' , '$window' , function($scope, $window) {
  $scope.url = $window.sessionStorage.baseurl;

  $scope.setUrl = function(){
    $window.sessionStorage.baseurl = $scope.url;
    $scope.displayText = "URL set";

  };

}]);
