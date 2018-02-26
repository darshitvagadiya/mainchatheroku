angular.module('mainApp')
	.factory('API', function($http){
		return{
			getFeed: function(){
				return $http.get('https://mainchatapp.herokuapp.com/api/chat');
			}
		}
	});