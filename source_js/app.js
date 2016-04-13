var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services', '720kb.datepicker']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  when('/userlist', {
    templateUrl: 'partials/userlist.html',
    controller: 'UserListController'
  }).
  when('/userdetails/:user_id', {
    templateUrl: 'partials/userdetails.html',
    controller: 'UserDetailsController'
  }).
  when('/usernew/', {
    templateUrl: 'partials/usernew.html',
    controller: 'UserNewController'
  }).
  when('/tasklist', {
    templateUrl: 'partials/tasklist.html',
    controller: 'TaskListController'
  }).
  when('/taskdetails/:task_id', {
    templateUrl: 'partials/taskdetails.html',
    controller: 'TaskDetailsController'
  }).
  when('/tasknew/', {
    templateUrl: 'partials/tasknew.html',
    controller: 'TaskNewController'
  }).
  when('/taskedit/:task_id', {
    templateUrl: 'partials/taskedit.html',
    controller: 'TaskEditController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);
