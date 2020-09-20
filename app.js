//jshint esversion:6

// Required for setting up express and body parsers
const express = require("express");
const bodyParser = require("body-parser");
// Assigns express to an app constant and body parser to the app constant
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
// Assigns port to listen to when fired up
app.listen(3000, function(){
  console.log("The server has been started on port 3000");
});
// What to send when a GET request is made on the port from a client
app.get("/", function(req, res){
  res.render("home", {});
}
app.get("/login", function(req, res){
  res.render("login", {});
});
app.get("/view", function(req, res){
  res.render("view", {});
});
app.get("/settings", function(req, res){
  res.render("settings", {});
});
app.get("/ticket/:ticknum", function(req, res){
  res.render("ticket", {});
});
// What to do and anything to send back when a POST request is sent
app.post("/index.html", function(req, res){
  req.body.XXXXX; // use this to select elements from the post request to take information from
  res.send("xxxx"); //use this to send information back
});


// Will need splash page, login page, view page, settings page, and ticket page
