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
    var formHeader = {headers:{ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
    // delete $http.defaults.headers.post['Content-type'];
    // delete $http.defaults.headers.delete['Content-type'];
    return {
        getAll : function(query) {
            if (typeof query === 'undefined') {
                query = "";
            }
            return $http.get(baseUrl+'/api/users' + query);
        },
        getOne : function(user_id) {
            return $http.get(baseUrl+'/api/users/' + user_id);
        },
        post : function(data) {
            return $http.post(baseUrl+'/api/users', $.param(data), formHeader);
        },
        delete : function(user_id) {
            return $http.delete(baseUrl+'/api/users/' + user_id);
        },
        put : function(user_id, data) {
            return $http.put(baseUrl+'/api/users/' + user_id, $.param(data), formHeader);
        }
    }
});

mp4Services.factory('UserDetails', function($http, $window) {
    var baseUrl = $window.sessionStorage.baseurl;
    var formHeader = {headers:{ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
    return {
        getUser : function(user_id) {
            return $http.get(baseUrl+'/api/users/' + user_id);
        },
        putUser : function(user_id, data) {
            return $http.put(baseUrl+'/api/users/' + user_id, $.param(data), formHeader);
        },
        getPendingTask : function(task_id) {
            return $http.get(baseUrl+'/api/tasks/' + task_id);
        },
        putCompletedTask : function(task_id, data) {
            return $http.put(baseUrl+'/api/tasks/' + task_id, $.param(data), formHeader);
        },
        getCompletedTasks: function (query) {
            return $http.get(baseUrl+'/api/tasks' + query);
        }
    }
});

mp4Services.factory('Tasks', function($http, $window) {
    var baseUrl = $window.sessionStorage.baseurl;
    var formHeader = {headers:{ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
    // delete $http.defaults.headers.post['Content-type'];
    // delete $http.defaults.headers.delete['Content-type'];
    return {
        getAll : function(query) {
            return $http.get(baseUrl + '/api/tasks' + query);
        },
        getOne : function(task_id) {
            return $http.get(baseUrl+'/api/tasks/' + task_id);
        },
        post : function(data) {
            return $http.post(baseUrl+'/api/tasks', $.param(data), formHeader );
        },
        delete : function(task_id) {
            return $http.delete(baseUrl+'/api/tasks/' + task_id);
        },
        put : function(task_id, data) {
            return $http.put(baseUrl+'/api/tasks/' + task_id, $.param(data), formHeader);
        }
    }
});
