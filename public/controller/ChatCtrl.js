angular.module('mainApp')
  .controller('ChatCtrl', function($scope, $location, $window, $rootScope, $auth, API) {

	if ($auth.isAuthenticated() && ($rootScope.currentUser && $rootScope.currentUser.username)) {
		$scope.logout = function() {
	      $auth.logout();
	      delete $window.localStorage.currentUser;
	    };
	}

	$scope.isAuthenticated = function() {
		return $auth.isAuthenticated();
	};

	$scope.linkInstagram = function() {
		$auth.link('instagram')
			.then(function(response) {
				$window.localStorage.currentUser = JSON.stringify(response.data.user);
				$rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
			});
	};

	

});