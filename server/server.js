var express = require('express');
var socketIO = require('socket.io');
var http = require('http');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var path = require('path');
var request = require('request');

var config = require('./config');
var User = require('./models/user');
mongoose.connect(config.db);

var port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

function createToken(user) {
  var payload = {
    exp: moment().add(14, 'days').unix(),
    iat: moment().unix(),
    sub: user._id
  };

  return jwt.encode(payload, config.tokenSecret);
};

function isAuthenticated(req, res, next){
	if(!(req.headers && req.headers.authorization)){
		return res.status(400).send({ message: 'You did not provide a JSON web token in the authorization header' });
	}

	var header = req.headers.authorization.split(' ');
	var token = header[1];
	var payload = jwt.decode(token, config.tokenSecret);
	var now = moment().unix();

	if(now > payload.exp){
		return res.status(401).send({ message: 'Token has expired.' });
	}

	User.findById(payload.sub, function(err, user){
		if(!user){
			return res.status(400).send({ message: 'User no longer exists.' })
		}
		req.user = user;
		next();
	})
};

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.post('/auth/login', function(req, res){
	User.findOne({ email: req.body.email }, '+password', function(err, user){
		if(!user){
			return res.status(401).send({ message: {email: 'Incorrect email' } });
		}
		bcrypt.compare(req.body.password, user.password, function(err, isMatch){
			if(!isMatch){
				return res.status(401).send({ message: {password: 'Incorrect password' } });
			}
			user = user.toObject();
			delete user.password;

			var token = createToken(user);
			res.send({ token: token, user: user });
		});
	});
});

app.post('/auth/signup', function(req, res){
	User.findOne({ email: req.body.email }, function(err, existingUser){
		if(existingUser){
			return res.status(409).send({ message: 'Email is already taken.' });
		}

		var user = new User({
			email: req.body.email,
			password:  req.body.password
		});

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(user.password, salt, function(err, hash){
				user.password = hash;

				user.save(function(){
					var token = createToken(user);
					res.send({ token: token, user: user })
				});
			});
		});
	});
});

app.post('/auth/instagram', function(req, res){
    var accessTokenUrl = 'https://api.instagram.com/oauth/access_token';

    var params = {
        client_id: req.body.clientId,
        redirect_uri: req.body.redirectUri,
        client_secret: config.clientSecret,
        code: req.body.code,
        grant_type: 'authorization_code'
    }; 
    request.post({ url: accessTokenUrl, form: params, json: true }, function(error, response, body){
        if(req.headers.authorization){            
           
           
           User.findOne({ instagramId: body.user.id }, function(err,  existingUser){
                var token = req.headers.authorization.split(' ')[1];
                var payload = jwt.decode(token, config.tokenSecret);
               
                User.findById(payload.sub, '+password', function(err, localUser){
                    if(!localUser){
                        return res.status(400).send({message: 'User not found.'});
                    } 
                    if(existingUser){
                        existingUser.email = localUser.email;
                        existingUser.password = localUser.password;

                        localUser.remove();

                        existingUser.save(function(){
                            var token = createToken(existingUser);
                            return res.send({ token: token, user: existingUser });
                        })
                    }else{
                        localUser.instagramId = body.user.id;
                        localUser.username = body.user.username;
                        localUser.fullName = body.user.full_name;
                        localUser.picture = body.user.profile_picture;
                        localUser.accessToken = body.access_token;

                        localUser.save(function(){
                            var token = createToken(localUser);
                            res.send({ token: token, user: localUser });
                        });
                    }
                })
            });
        } else{
            User.findOne({ instagramId: body.user.id }, function(err, existingUser){
                if(existingUser){
                    var token = createToken(existingUser);
                    return res.send({ token: token, user: existingUser })
                }

                var user = new User({
                    instagramId: body.user.id,
                    username: body.user.username,
                    fullName: body.user.full_name,
                    picture: body.user.profile_picture,
                    accessToken: body.access_token
                });

                user.save(function(){
                    var token = createToken(user);
                    res.send({ token: token, user: user });
                });
            });
        }
    });
});

app.get('/api/chat', isAuthenticated, function(req, res){
    User.find({}, function(err, users){
        var userMap = {};

        users.forEach(function(user){
            userMap[user] = user;
        });
        res.send(userMap);
    })
});


server.listen(port, function(){
	console.log(`server is running on ${port}`);
})