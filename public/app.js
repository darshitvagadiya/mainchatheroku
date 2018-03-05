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

		$authProvider.loginUrl = 'https://mainchatapp.herokuapp.com/auth/login';
		$authProvider.signupUrl = 'https://mainchatapp.herokuapp.com/auth/signup';
		$authProvider.oauth2({
		  name: 'instagram',
		  url: 'https://mainchatapp.herokuapp.com/auth/instagram',
		  redirectUri: 'https://mainchatapp.herokuapp.com',
		  clientId: 'dc4d6a7ecd0248e7a896434f86a816c3',
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

	var socket = io();

socket.on('connect', function(){
	console.log('Connected to sockets');
});

socket.on('disconnect', function(){
	console.log('Disconnected from server');
});

socket.on('newMessage', function(message){
	console.log('New message', message);
});

socket.on('welcome', function(data){
	console.log(data);
});

socket.on('user', function(data){
	console.log(data);
});

jQuery('#message').on('submit', function(e){
	 e.preventDefault();

	 socket.emit('createMessage', {
	 	from: "User",
	 	text: jQuery('[name=message]').val()
	 }, function(){

	 });
}); 