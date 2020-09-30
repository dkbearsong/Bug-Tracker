// routes/index.js

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  res.render('home', {
    pageTitle: "ZipLoll",
    title: 'Auth0 Webapp sample Nodejs'
   });
});

module.exports = router;
