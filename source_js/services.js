var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('CommonData', function(){
    var data = "";
    return{
        getData : function(){
            return data;
        },
        setData : function(newData){
            data = newData;
        }
    }
});

mp4Services.factory('Users', function($http, $window) {
    var baseUrl = $window.sessionStorage.baseurl;
    // delete $http.defaults.headers.post['Content-type'];
    // delete $http.defaults.headers.delete['Content-type'];
    return {
        getAll : function() {
            return $http.get(baseUrl+'/api/users');
        },
        getOne : function(user_id) {
            return $http.get(baseUrl+'/api/users/' + user_id);
        },
        post : function(data) {
            return $http.post(baseUrl+'/api/users', data);
        },
        delete : function(user_id) {
            return $http.delete(baseUrl+'/api/users/' + user_id);
        },
        put : function(user_id, data) {
            return $http.put(baseUrl+'/api/users/' + user_id, data);
        }
    }
});

mp4Services.factory('Tasks', function($http, $window) {
    var baseUrl = $window.sessionStorage.baseurl;
    // delete $http.defaults.headers.post['Content-type'];
    // delete $http.defaults.headers.delete['Content-type'];
    return {
        getAll : function(condition) {
            return $http.get(baseUrl + '/api/tasks' + condition);
        },
        getOne : function(task_id) {
            return $http.get(baseUrl+'/api/tasks/' + task_id);
        },
        post : function(data) {
            return $http.post(baseUrl+'/api/tasks', data);
        },
        delete : function(task_id) {
            return $http.delete(baseUrl+'/api/tasks/' + task_id);
        },
        put : function(task_id, data) {
            return $http.put(baseUrl+'/api/tasks/' + task_id, data);
        }
    }
});
