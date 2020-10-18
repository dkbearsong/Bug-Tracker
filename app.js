//jshint esversion:6

// Required for setting up express and body parsers
const express = require("express");
const path = require('path');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const {
  auth
} = require('express-openid-connect');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const dotenv = require('dotenv').config({path: './lib/.env'});
const userInViews = require('./lib/middleware/userInViews');
const main = require ('./lib/main');
const sql = require('./lib/sql');
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const escapeRegExp = require('lodash.escaperegexp');
const secured = require('./lib/middleware/secured');

// Assigns express to an app constant
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

module.exports = {
  getConnection: function() {
    return new Promise(function(resolve, reject) {
      pool.getConnection().then(function(connection) {
        resolve(connection);
      }).catch(function(error) {
        reject(error);
      });
    });
  }
}

// Configure Passport to use Auth0 with a strategy
const myVars = {
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/callback'
}
const strategy = new Auth0Strategy(myVars, function(accessToken, refreshToken, extraParams, profile, done) {
  return done(null, profile);
});
passport.use(strategy);

// setting up serializing and deserializing users
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(
  session({
    secret: 'Mn502Mn502#!Fc902Fc902',
    resave: true,
    saveUninitialized: true
  })
)

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.loggedIn = false;
  if (req.session.passport && typeof req.session.passport.user != 'undefined') {
    res.locals.loggedIn = true;
  }
  next();
})


// Assigns port to listen to when fired up
app.listen(process.env.PORT || 3000, function() {
  console.log("The server has been started on port 3000");
});
// 404 catch


// What to send when a GET request is made on the port from a client
app.use(userInViews());
app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/', usersRouter);
app.get('/failure', function(req, res, next) {
  res.render('failure');
});

// Table views
app.get("/dashboard", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.getTickets, sql.getOpenCount,sql.getMyCount(userProfile.user_id)];
  const results = await main.runQueries(codeBuilder);
  res.render("dashboard", {
    pageTitle: "Ziploll: Dashboard",
    user: results[0][0].name,
    user_id: results[0][0].id,
    open: results[1],
    openCount: results[2][0].count,
    myCount: results[3][0].count,
  });
});
app.get("/assignedtome", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const currentUser = await main.runQueries([sql.getCurrentUser(userProfile.user_id)]);
  const results = await main.runQueries([sql.getMyTickets(currentUser[0][0].id)]);
  res.render("assignedtome", {
    pageTitle: "Ziploll: Assigned to Me",
    user: currentUser[0][0].name,
    user_id: currentUser[0][0].id,
    open: results[0],
  });
});
app.get("/allprojects", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.getAllProjects];
  const results = await main.runQueries(codeBuilder);
  res.render("allprojects", {
    pageTitle: "Ziploll: All Projects",
    user: results[0][0].name,
    user_id: results[0][0].id,
    open: results[1],
  });
});
app.get("/allusers", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.getAllUsers];
  const results = await main.runQueries(codeBuilder);
  res.render("allusers", {
    pageTitle: "Ziploll: All Users",
    user: results[0][0].name,
    user_id: results[0][0].id,
    open: results[1],
  });
});

// UserProfiles
app.get("/newprofile", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.getUserCat, sql.getStates];
  const results = await main.runQueries(codeBuilder);
  res.render("newProfile", {
    pageTitle: "Ziploll: New User",
    user: results[0][0].name,
    user_id: results[0][0].id,
    categories: results[1],
    states: results[2].slice(0, 52)
  });
});
app.post("/newProfile", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let extReq =  '';
  if (req.body.extension != '') {
    extReq = '\', ext = ' + req.body.extension;
  }
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.insertNewProfile(req.body.first_name, req.body.last_name, req.body.email, req.body.phone_number, extReq, req.body.address_1, req.body.address_2, req.body.city, req.body.state, req.body.zipcode, req.body.auth0), sql.getCreatedUser];
  const results = await main.runQueries(codeBuilder);
  res.redirect('/profile/' + results[2][0].id);
});
app.get("/profile/:user", secured(), async function(req, res){
  const { _raw, _json, ...userProfile } = req.user;
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.getUserCat, sql.getStates, sql.getUser(req.params.user)];
  const results = await main.runQueries(codeBuilder);
  res.render("profile", {
    pageTitle: "Ziploll: " + results[3][0].name + "\'s Profile",
    user: results[0][0].name,
    user_id: results[0][0].id,
    categories: results[1],
    states: results[2].slice(0, 52),
    userProfile: results[3][0],
  });
});
app.post("/profile", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let extReq = '';
  if (req.body.extension != '') {
    extReq = '\', ext = ' + req.body.extension;
  }
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.updateProfile(req.body.first_name, req.body.last_name, req.body.email, req.body.phone_number, extReq, req.body.address_1, req.body.address_2, req.body.city, req.body.state, req.body.zipcode, req.body.auth0, req.body.user_id)];
  const results = await main.runQueries(codeBuilder);
  res.redirect('/profile/' + req.body.user_id);
});
// Projects
app.get("/newProject", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.getCategories];
  const results = await main.runQueries(codeBuilder);
  res.render("newProject", {
    pageTitle: "Ziploll: New Project",
    user: results[0][0].name,
    user_id: results[0][0].id,
    categories: results[1],
  });
});
app.post("/newProject", secured(), async function(req, res) {
  // Need to refactor here
  const { _raw, _json, ...userProfile } = req.user;
  const postDetails = {"feature": JSON.parse(req.body.features), "language": JSON.parse(req.body.languages), "sprint": JSON.parse(req.body.sprints)};
  const insertQuery = sql.newProjInsert(req.body.project_name, req.body.project_description, req.body.category, main.getDateTime(), req.body.created_by);
  let insertDetails = {
    "feature": "",
    "language": "",
    "sprint": ""
  }
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), insertQuery];
  const results = await main.runQueries(codeBuilder);
  const id = await main.runQueries([sql.getCreatedProject]);
  Object.keys(insertDetails).forEach(item => main.queryBuilder(postDetails, item, id[0][0].id));
  res.redirect('/projects/' + id[0][0].id);
});
app.get("/projects/:projnum", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let projDeets = {"features": "", "languages": "", "sprints": ""};
  const projDesc = await main.runQueries([sql.getProjectDetails(req.params.projnum)]);
  projDeets.features =  main.deetFunction(projDesc[0], "feature", 0);
  projDeets.languages = main.deetFunction(projDesc[0], "language", 0);
  projDeets.sprints = main.deetFunction(projDesc[0], "sprint", 1);
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.getProjectById(req.params.projnum), sql.getCategories];
  const results = await main.runQueries(codeBuilder);
  res.render("project", {
    pageTitle: "Ziploll: Project #" + req.params.projnum + " " + results[1][0].project_name,
    user: results[0][0].name,
    user_id: results[0][0].id,
    project: results[1][0],
    categories: results[2],
    features: projDeets.features,
    languages: projDeets.languages,
    sprints: projDeets.sprints
  });
});
app.post("/project", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const postDetails = {"feature": JSON.parse(req.body.features), "language": JSON.parse(req.body.languages), "sprint": JSON.parse(req.body.sprints)};
  const updateQuery = sql.updateProject(req.body.project_name, req.body.project_description, req.body.category, req.body.proj_id);
  let updateDetails = {
    "feature": "",
    "language": "",
    "sprint": ""
  }
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), updateQuery];
  const results = await main.runQueries(codeBuilder);
  const id = await main.runQueries([sql.getCreatedProject]);
  Object.keys(updateDetails).forEach(item => main.queryBuilder(postDetails, item, id[0][0].id));
  res.redirect('/projects/' + req.body.proj_id);
});
// Tickets
app.get("/newTicket", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.getProjects, sql.getTicketAuth, sql.getTicketCategories];
  const results = await main.runQueries(codeBuilder);
  res.render("newTicket", {
    pageTitle: "Ziploll: New Ticket",
    user: results[0][0].name,
    user_id: results[0][0].id,
    projects: results[1],
    users: results[2],
    categories: results[3]
  });
});
app.post("/newTicket", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.insertNewTicket(req.body.ticket_title, req.body.ticket_description, req.body.severity, req.body.project, req.body.category, main.getDateTime(), req.body.created_by), sql.getCreatedTicket];
  const results = await main.runQueries(codeBuilder);
  res.redirect('/ticket/' + results[2][0].id);
});
app.get("/ticket/:ticknum", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), sql.findTicket(req.params.ticknum), sql.getTicketAuth, sql.getTicketCategories, sql.getStatus,sql.getSeverity, sql.getTicketNotes(req.params.ticknum)];
  const results = await main.runQueries(codeBuilder);
  res.render("ticket", {
    pageTitle: "Ziploll: Ticket #" + req.params.ticknum + " " + results[1].title,
    user: results[0][0].name,
    user_id: results[0][0].id,
    results: results[1][0],
    users: results[2],
    ticketCategories: results[3],
    status: results[4],
    severity: results[5],
    notes: results[6]
  });
});
app.post("/ticket", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const updateTicketQuery = sql.updateTicket(req.body.ticket_title, req.body.ticket_description, req.body.severity, req.body.assigned_to, req.body.status, req.body.ticket_category, main.getDateTime(), req.body.ticket_value);
  const codeBuilder = [sql.getCurrentUser(userProfile.user_id), updateTicketQuery];
  if (req.body.new_note != "") {
    const insertNote = sql.addNote(req.body.ticket_value, main.getDateTime(), req.body.created_by, req.body.new_note);
    codeBuilder.push(insertNote);
  }
  const results = await main.runQueries(codeBuilder);
  res.redirect('/ticket/' + req.body.ticket_value);
});
