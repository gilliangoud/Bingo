var express = require('express');
var router = express.Router();
var hbs = require('hbs');
var User = require('../models/user');
var tables = require('../models/tables');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

var isAdmini = function (req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.isAdmin) {
			return next();
		} else
		res.redirect('back');
	} else
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
		if (req.isAuthenticated()) {
			res.redirect('/home');
		} else {
	    	// Display the Login page with any flash message, if any
			res.render('index', { message: req.flash('message') });
		}
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', {});
	});

	router.get('/leaderboard', isAuthenticated, function(req, res){
		//var query = req.query; different style
			User.find({coins: {$gt: 1000}}, ['name', 'lastName', 'coins', 'avatar', 'private'], {skip:0, limit:10, sort:{coins: -1}}, function(err, result){
				if(err){
					console.log(err);
				} else {
					res.render('user/leaderboard', { profile: result });
				}
			});
	});

	/* GET profile Page */
	router.get('/profile', isAuthenticated, function(req, res){
		res.render('profile', { profile: req.user });
	});

	router.get('/profile/edit', isAuthenticated, function(req, res){
		res.render('user/edit-personal', { profile: req.user });
	});

	router.post('/profile/edit', isAuthenticated, function(req, res) {
		var newUser = {};
		newUser.username = req.body.username;
		newUser.name = req.body.name;
		newUser.lastName = req.body.lastName;
		newUser.email = req.body.email;
		newUser.phone = req.body.phone;
		newUser.coins = req.body.coins;
		newUser.isAdmin = req.body.isAdmin;

		User.findByIdAndUpdate(req.user.id, newUser, {new: true}, (err, result) => {
			if(err) throw err;
		});
		res.redirect('/profile');
	});

	router.get('/profile/:param1', isAuthenticated, function(req, res){
		//var query = req.query; different style
		var query = req.params.param1;
			const regex = new RegExp(escapeRegex(query), 'gi');
			User.find({ 'username' : regex }, function(err, result){
				if(err){
					console.log(err);
				} else {
					res.render('user/show', { profile: result });
				}
			});
	});

	router.get('/users', isAuthenticated, function(req, res){
		//var query = req.query; different style
			User.find({}, function(err, result){
				if(err){
					console.log(err);
				} else {
					res.render('user/show', { profile: result });
				}
			});
	});

	router.get('/users/create', isAuthenticated, function(req, res) {
		res.render('user/create');
	});

	router.post('/users/create', isAuthenticated, function(req, res) {
		createUser = function(){
                    // create the table
                    var newUser = new User();
                    // set the user's local credentials
                    newUser.username = req.body.username;
					newUser.name = req.body.name;
					newUser.lastName = req.body.lastName;
					newUser.email = req.body.email;
					newUser.phone = req.body.phone;
					newUser.gender = req.body.gender;
					newUser.coins = req.body.coins;
					newUser.age = req.body.age;
					newUser.isAdmin = req.body.isAdmin;
					newUser.private = req.body.private;
                    // save the user
                    newUser.save(function(err) {
                        if (err){
                            console.log('Error in Saving the table: '+err);  
                            throw err;  
                        }  
                    });
                };
        // Delay the execution of createTable and execute the method
        // in the next tick of the event loop
        process.nextTick(createUser);

		res.redirect('/users');
	});

	router.get('/users/:param1', isAuthenticated, function(req, res){
		//var query = req.query; different style
		var query = req.params.param1;
			User.findById(query, function(err, result){
				if(err){
					console.log(err);
				} else {
					res.render('user/edit', { profile: result });
				}
			});
	});

	router.post('/users/update/:id', isAuthenticated, function(req, res) {
		var newUser = {};
		newUser.username = req.body.username;
		newUser.name = req.body.name;
		newUser.lastName = req.body.lastName;
		newUser.email = req.body.email;
		newUser.phone = req.body.phone;
		newUser.coins = req.body.coins;
		newUser.isAdmin = req.body.isAdmin;

		User.findByIdAndUpdate(req.params.id, newUser, {new: true}, (err, result) => {
			if(err) throw err;
		});
		res.redirect('/users/' + req.params.id);
	});

	router.post('/users/reset/:id', isAdmini, function(req, res) {
		var newUser = {};
		newUser.coins = '1000';

		User.findByIdAndUpdate(req.params.id, newUser, {new: true}, (err, result) => {
			if(err) throw err;
		});
		res.redirect('/users');
	});

	router.post('/users/ban/:id', isAdmini, function(req, res) {
		var newUser = {};
		User.findById(req.params.id, function(err, result){
				if(err){
					console.log(err);
				} else {
					if(result.isBanned == true){
						newUser.isBanned = false;
						User.findByIdAndUpdate(req.params.id, newUser, {new: true}, (err, result) => {
							if(err) throw err;
						});
					} else {
						newUser.isBanned = true;
						User.findByIdAndUpdate(req.params.id, newUser, {new: true}, (err, result) => {
							if(err) throw err;
						});
					}
				}
			});
		res.redirect('/users');
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		req.session.destroy();
		res.redirect('/');
	});

	router.get('/tables', isAuthenticated, function(req, res) {
		tables.find({}, function(err, result){
			if(err){
				console.log(err);
			} else {
				res.render('tables/show', { content: result});
			}
		});
	});

	router.get('/tables/create', isAuthenticated, function(req, res) {
		res.render('tables/create');
	});

	router.post('/tables/create', isAuthenticated, function(req, res) {
		createTable = function(){
                    // create the table
                    var newTable = new tables();
                    // set the user's local credentials
                    newTable.tableName = req.body.tableName;
                    newTable.room = req.body.room;
                    newTable.state = req.body.available;
                    newTable.playerLimit = req.body.playerlimit;
                    newTable.openHour = req.body.openHour;
                    newTable.closeHour = req.body.closeHour;
                    newTable.daysOpen = req.body.days;
                    // save the user
                    newTable.save(function(err) {
                        if (err){
                            console.log('Error in Saving the table: '+err);  
                            throw err;  
                        }
                        console.log('Table succesfully created' + newTable);   
                    });
                };
        // Delay the execution of createTable and execute the method
        // in the next tick of the event loop
        process.nextTick(createTable);

		res.redirect('/tables');
	});

	router.post('/tables/delete/:id', isAuthenticated, function(req, res) {
		tables.findByIdAndRemove(req.params.id, (err, tables) => {
			if(err) throw err;
		});

		res.redirect('/tables');
	});

	router.post('/tables/update/:id', isAuthenticated, function(req, res) {
		var newTable = {};
		newTable.tableName = req.body.tableName;
		newTable.room = req.body.room;
		newTable.state = req.body.available;
		newTable.playerLimit = req.body.playerLimit;
		newTable.openHour = req.body.openHour;
        newTable.closeHour = req.body.closeHour;
        newTable.daysOpen = req.body.days;
        newTable.dayOpen = {monday: req.body.monday, tuesday: req.body.tuesday, wednesday: req.body.wednesday, thursday: req.body.thursday, friday: req.body.friday, saturday: req.body.saturday, sunday: req.body.sunday};

		tables.findByIdAndUpdate(req.params.id, newTable, {new: true}, (err, tables) => {
			if(err) throw err;

			console.log(tables);
		});
		res.redirect('/tables');
	});

	router.get('/tables/:param1', isAuthenticated, function(req, res){
		//var query = req.query; different style
		var query = req.params.param1;
			tables.findById(query, function(err, result){
				if(err){
					console.log(err);
				} else {
					console.log("result: " + result)
					res.render('tables/edit', { content: result });
				}
			});
	});

	router.get('/api/user_id', isAuthenticated, function(req, res) {

            if (req.user === undefined) {
                // The user is not logged in
                res.json({});
            } else {
                res.json({
                    id: req.user.id,
                    username: req.user.username
                });
            }
    });

	function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};

	return router;
}





