var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(),
    config = require(__dirname + '/config'),
    mongoose = require('mongoose'),
    db = mongoose.connect('mongodb://localhost/mydb'),
    Schema = mongoose.Schema;
 
var User = new Schema({
  username: String,
  title: String
});
var userModel = mongoose.model('User', User);
 
var user = new userModel();
 
user.username = 'Chad';
user.title = 'Senior Developer';
user.save(function(err) {
  if (err) throw err;
  console.log('User saved, starting server...');
  app.listen(8080);
});  
 
// app.configure( function() {
//     console.log('I will be listening on: ' + config.routes.feed);
// });
 
app.get(config.routes.feed, function(req, res) {
    res.contentType('application/json');  
    
    userModel.findOne({'username': 'Chad'}, function(err, user) {
      if (user != null) {
        console.log('Found the User:' + user.username);
        res.json  (user);
      }
    });
});