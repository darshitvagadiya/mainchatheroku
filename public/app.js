angular.module('mainApp', ['ngRoute', 'ngMessages', 'satellizer'])
	.config(function($routeProvider, $authProvider){
		$routeProvider

			.when('/login', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.when('/signup', {
				templateUrl: 'views/signup.html',
				controller: 'SignupCtrl'
			})
			.when('/chat', {
				templateUrl: 'views/chat.html',
				controller: 'ChatCtrl'
			})
			.otherwise('/chat');

		$authProvider.loginUrl = 'http://localhost:3000/auth/login';
		$authProvider.signupUrl = 'http://localhost:3000/auth/signup';
		$authProvider.oauth2({
		  name: 'instagram',
		  url: 'http://localhost:3000/auth/instagram',
		  redirectUri: 'http://localhost:3000',
		  clientId: '65f439be04b741bc862286c1bb630246',
		  requiredUrlParams: ['scope'],
		  scope: ['likes'],
		  scopeDelimiter: '+',
		  authorizationEndpoint: 'https://api.instagram.com/oauth/authorize'
		});
	})
	.run(function($rootScope, $window, $auth) {
		if ($auth.isAuthenticated()) {
			$rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
		}
	});