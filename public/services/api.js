angular.module('mainApp')
	.factory('API', function($http){
		return{
			getFeed: function(){
				return $http.get('http://localhost:3000/api/chat');
			},
			logout: function(){
				return $http.delete('http://localhost:3000/auth/logout');
			}
		}
	});