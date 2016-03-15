//http://tonyspiro.com/uploading-resizing-images-fly-node-js-express/
//https://github.com/mongodb/node-mongodb-native

const express = require("express"),
	app = express(),
	bodyParser = require('body-parser'),
	path = require('path'),
	formidable = require('formidable'),
	util = require('util'),
	fs   = require('fs-extra'),
	MongoClient = require('mongodb').MongoClient,
	url = "mongodb://localhost:27017/userimages",
	upDirLoc = "uploads/",
	qt   = require('quickthumb');port = 8080;

var isConnected = false,
	mongodb = null,
	images = null;

// Use quickthumb
app.use(qt.static(__dirname + '/'));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Display home page
app.get('/', function (req, res) {
	res.render('index', { title: 'Hey', message: 'Hello there!'});
});

// Show the upload form
app.get('/form', function (req, res){
	res.render('form');
});

app.get('/images', function(req, res){
	images.find({}).toArray(function(err, recs){
		console.log(recs);
		res.json(recs);
	});
});

app.get('/images/:username', function(req, res){
	var uname = req.params.username;
	images.find({ 'username': uname }).toArray(function(err, recs){
		console.log(recs);
		res.json(recs);
	});
});

app.post('/upload', function (req, res){
	var form = new formidable.IncomingForm();
	var	username = "";

	form.parse(req, function(err, fields, files) {
		console.log("Successfully parse the image uploaded");
		username = fields.username;
		console.log(username);
	});

	form.on('end', function(fields, files) {
		/* Temporary location of our uploaded file */
		var temp_path = this.openedFiles[0].path;
		/* The file name of the uploaded file */
		var file_name = this.openedFiles[0].name;
		/* Location where we want to copy the uploaded file */

		fs.copy(temp_path, upDirLoc + username +"/"+ file_name, function(err) {
			if (err) {
				console.error(err);
				res.status(500).send("Unable to process result");
			} else {
				console.log("success!");
				images.insertOne({
					'username' : username,
					'imageLoc': upDirLoc + file_name,
					'imageName': file_name
				}, function(err, dataRes){
					if (!err){
						res.json(dataRes.ops);
					}else{
						console.log(err);
						res.status(500).send("Unable to process result");
					}
				});
			}
		});
	});
});

MongoClient.connect(url, function(err, db){
	console.log("Connection to Mongo database established");
	if (!err){
		mongodb = db;
		isConnected = true;

		images = mongodb.collection("user_images");

		// Establish connection to server
		app.listen(port, function(){
			console.log("Listening on: " + port);
		});
	}
});


