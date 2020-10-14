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
const mariadb = require('mariadb');
const Auth0Strategy = require('passport-auth0');
const dotenv = require('dotenv');
const userInViews = require('./lib/middleware/userInViews');
const sql = require('./lib/sql');
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const escapeRegExp = require('lodash.escaperegexp');
const secured = require('./lib/middleware/secured');
dotenv.config();

// Assigns express to an app constant
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

// creating mariadb connection pool
const pool = mariadb.createPool({
  host: "127.0.0.1",
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  multipleStatements: true
})

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
  // accessToken is the token to call Auth0 API (not needed in the most cases)
  // extraParams.id_token has the JSON Web Token
  // profile has all the information from the user
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
app.listen(3000, function() {
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
  let conn;
  try {
    conn = await pool.getConnection();
    const openTickets = await conn.query(sql.getTickets);
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    const openCount = await conn.query(sql.getOpenCount);
    const myCountQuery = await conn.query(sql.getMyCount(userProfile.user_id));
    res.render("dashboard", {
      pageTitle: "Ziploll: Dashboard",
      open: openTickets,
      openCount: openCount[0].count,
      myCount: myCountQuery[0].count,
      user: user[0].name,
      user_id: user[0].id
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.get("/assignedtome", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    const myTickets = await conn.query(sql.getMyTickets(user[0].id));
    res.render("assignedtome", {
      pageTitle: "Ziploll: Assigned to Me",
      open: myTickets,
      user: user[0].name,
      user_id: user[0].id
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.get("/allprojects", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    const allProjects = await conn.query(sql.getAllProjects);
    res.render("allprojects", {
      pageTitle: "Ziploll: All Projects",
      open: allProjects,
      user: user[0].name,
      user_id: user[0].id
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.get("/allusers", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    const allUsers = await conn.query(sql.getAllUsers);
    res.render("allusers", {
      pageTitle: "Ziploll: All Users",
      open: allUsers,
      user: user[0].name,
      user_id: user[0].id
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

// UserProfiles
app.get("/newprofile", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    const categories = await conn.query(sql.getUserCat);
    const statesList = await conn.query(sql.getStates);
    res.render("newProfile", {
      pageTitle: "Ziploll: New User",
      user: user[0].name,
      user_id: user[0].id,
      categories: categories,
      states: statesList.slice(0, 52)
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.post("/newProfile", secured(), async function(req, res) {
  let conn;
  let extReq = '';
  if (req.body.extension != '') {
    extReq = '\', ext = ' + req.body.extension;
  }
  const insertQuery = sql.insertNewProfile(req.body.first_name, req.body.last_name, req.body.email, req.body.phone_number, extReq, req.body.address_1, req.body.address_2, req.body.city, req.body.state, req.body.zipcode, req.body.auth0);
  console.log(insertQuery);
  console.log(sql.getCreatedUser);
  try {
    conn = await pool.getConnection();
    const results = await conn.query(insertQuery);
    const id = await conn.query(sql.getCreatedUser);
    res.redirect('/profile/' + id[0].id);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.get("/profile/:user", secured(), async function(req, res){
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    const searchUserProfile = await conn.query(sql.getUser(req.params.user));
    const statesList = await conn.query(sql.getStates);
    res.render("profile", {
      pageTitle: "Ziploll: " + user[0].name + "\'s Profile",
      user: user[0].name,
      user_id: user[0].id,
      userProfile: searchUserProfile[0],
      states: statesList.slice(0, 52)
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.post("/profile", secured(), async function(req, res) {
  let conn;
  let extReq = '';
  if (req.body.extension != '') {
    extReq = '\', ext = ' + req.body.extension;
  }
  const insertQuery = sql.updateProfile(req.body.first_name, req.body.last_name, req.body.email, req.body.phone_number, extReq, req.body.address_1, req.body.address_2, req.body.city, req.body.state, req.body.zipcode, req.body.auth0, req.body.user_id);
  console.log(insertQuery);
  try {
    conn = await pool.getConnection();
    const results = await conn.query(insertQuery);
    res.redirect('/profile/' + req.body.user_id);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
// Projects
app.get("/newProject", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    let categories = await conn.query(sql.getCategories);
    res.render("newProject", {
      pageTitle: "Ziploll: New Project",
      user: user[0].name,
      user_id: user[0].id,
      categories: categories
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.post("/newProject", secured(), async function(req, res) {
  let conn;
  const projectFeat = JSON.parse(req.body.features);
  const projectLang = JSON.parse(req.body.languages);
  const projectSprints = JSON.parse(req.body.sprints);
  const insertQuery = sql.newProjInsert(req.body.project_name, req.body.project_description, req.body.category, getDateTime(), req.body.created_by);
  let insertFeatures = "";
  let insertLanguages = "";
  let insertSprints = "";

  try {
    conn = await pool.getConnection();
    const results = await conn.query(insertQuery);
    const id = await conn.query(sql.getCreatedProject);
    Object.keys(projectFeat).forEach(item => {insertFeatures = insertFeatures.concat(sql.insertProjDetails(id[0].id, 'feature', projectFeat[item]["feature"], ''))});
    Object.keys(projectLang).forEach(item => {insertLanguages = insertLanguages.concat(sql.insertProjDetails(id[0].id, 'language', projectLang[item]["language"], ''))});
    Object.keys(projectSprints).forEach(item => {insertSprints = insertSprints.concat(  sql.insertProjDetails(id[0].id, 'sprint', projectSprints[item]["sprint"], ', sprint_num =' + projectSprints[item]["sprint_num"] + ', is_checked = ' + projectSprints[item]["checked"]))});
    if (insertFeatures != "") {
      const feat = await conn.query(insertFeatures);
    }
    if (insertLanguages != "") {
      const lang = await conn.query(insertLanguages);
    }
    if (insertSprints != "") {
      const sprints = await conn.query(insertSprints);
    }
    res.redirect('/projects/' + id[0].id);
    // res.redirect('/dashboard');
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.get("/projects/:projnum", secured(), async function(req, res) {
  // Need to update this to focus on projects rather than the tickets
  const { _raw, _json, ...userProfile } = req.user;
  const reqProject = req.params.projnum;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    const proj = await conn.query(sql.getProjectById(reqProject));
    const projDesc = await conn.query(sql.getProjectDetails(reqProject));
    let categories = await conn.query(sql.getCategories);
    let features = "{";
    let languages = "{";
    let sprints =  "{";
    let counter = 0
    let item = '';
    for (var i = 0; i < projDesc.length; i++) {
      if (projDesc[i].feature != null) {
        item = objFormater(counter, projDesc[i].id, "feature", projDesc[i].feature + '\"');
        features = features.concat(', ', item);
        counter++;
      }
    }
    features = features.concat('', '}');
    features = features.replace(', ', '');
    counter = 0;
    for (var i = 0; i < projDesc.length; i++) {
      if (projDesc[i].language != null) {
        item = objFormater(counter, projDesc[i].id, "language", projDesc[i].language + '\"');
        languages = languages.concat(', ', item);
        counter++;
      }
    }
    languages = languages.concat('', '}');
    languages = languages.replace(', ', '');
    counter = 0
    for (var i = 0; i < projDesc.length; i++) {
      if (projDesc[i].sprint != null) {
        item = objFormater(counter, projDesc[i].id, "sprint", projDesc[i].sprint + '\", \"sprint_num\": ' + projDesc[i].sprint_num + ', \"checked\": ' + projDesc[i].is_checked);
        sprints = sprints.concat(', ', item);
        counter++;
      }
    }
    sprints = sprints.concat('', '}');
    sprints = sprints.replace(', ', '');
    res.render("project", {
      pageTitle: "Ziploll: Project #" + reqProject + " " + proj[0].project_name,
      user: user[0].name,
      user_id: user[0].id,
      project: proj[0],
      categories: categories,
      features: features,
      languages: languages,
      sprints: sprints
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.post("/project", secured(), async function(req, res) {
  let conn;
  const projectFeat = JSON.parse(req.body.features);
  const projectLang = JSON.parse(req.body.languages);
  const projectSprints = JSON.parse(req.body.sprints);
  const updateQuery = sql.updateProject(req.body.project_name, req.body.project_description, req.body.category, req.body.proj_id);
  let updateFeatures = "";
  let updateLanguages = "";
  let updateSprints = "";
  const projUpdate = (action, table, id, item, where) => action + ' proj_' + table + 's SET project_id = ' + id + ', ' + table + ' = \'' + escapeRegExp(item).replace(/"/g, '\\\"').replace(/'/g, "\\\'") + '\' ' + where + '; ';
  try {
    conn = await pool.getConnection();
    const results = await conn.query(updateQuery);
    const id = await conn.query(sql.getCreatedProject);
    Object.keys(projectFeat).forEach(item => {
      if (projectFeat[item]["id"] != 0 && projectFeat[item]["feature"] != '') {
        updateFeatures = updateFeatures.concat(projUpdate('UPDATE', 'feature', req.body.proj_id, projectFeat[item]["feature"], "WHERE id = " + projectFeat[item]["id"]));
      } else if (projectFeat[item]["id"] != 0 && projectFeat[item]["feature"] === '' ) {
        updateFeatures = updateFeatures.concat('DELETE FROM proj_features WHERE id = ' + projectFeat[item]["id"] + '; ');
      } else if (projectFeat[item]["id"] === 0 && projectFeat[item]["feature"] != '') {
        updateFeatures = updateFeatures.concat(projUpdate('INSERT INTO', 'feature', req.body.proj_id, projectFeat[item]["feature"], ''));
      }
    });
    Object.keys(projectLang).forEach(item => {
      if (projectLang[item]["id"] != 0 && projectLang[item]["language"] != '') {
        updateLanguages = updateLanguages.concat(projUpdate('UPDATE', 'language', req.body.proj_id, projectLang[item]["language"], "WHERE id = " + projectLang[item]["id"]));
      } else if (projectLang[item]["id"] != 0 && projectLang[item]["language"] === '' ) {
        updateLanguages = updateLanguages.concat('DELETE FROM proj_languages WHERE id = ' + projectLang[item]["id"] + '; ');
      } else if (projectLang[item]["id"] === 0 && projectLang[item]["language"] != '') {
        updateLanguages = updateLanguages.concat(projUpdate('INSERT INTO', 'language', req.body.proj_id, projectLang[item]["language"], ''));
      }
    });
    Object.keys(projectSprints).forEach(item => {
      if (projectSprints[item]["id"] != 0 && projectSprints[item]["sprint"] != '') {
        updateSprints = updateSprints.concat(projUpdate('UPDATE', 'sprint', req.body.proj_id, projectSprints[item]["sprint"], ', sprint_num =' + projectSprints[item]["sprint_num"] + ', is_checked = ' + projectSprints[item]["checked"] + ' WHERE id = ' + projectSprints[item]["id"]));
      } else if (projectSprints[item]["id"] != 0 && projectSprints[item]["sprint"] === '' ) {
        updateSprints = updateSprints.concat('DELETE FROM proj_sprints WHERE id = ' + projectSprints[item]["id"] + '; ');
      } else if (projectSprints[item]["id"] === 0 && projectSprints[item]["sprint"] != '') {
        updateSprints = updateSprints.concat(projUpdate('INSERT INTO', 'sprint', req.body.proj_id, projectSprints[item]["sprint"], ', sprint_num =' + projectSprints[item]["sprint_num"] + ', is_checked = ' + projectSprints[item]["checked"]));
      }
    });
    console.log(updateSprints);
    if (updateFeatures != "") {
      const feat = await conn.query(updateFeatures);
    }
    if (updateLanguages != "") {
      const lang = await conn.query(updateLanguages);
    }
    if (updateSprints != "") {
      const sprints = await conn.query(updateSprints);
    }
    res.redirect('/projects/' + req.body.proj_id);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
// Tickets
app.get("/newTicket", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    const projs = await conn.query(sql.getProjects);
    const users = await conn.query(sql.getTicketAuth);
    const cat = await conn.query(sql.getTicketCategories);
    res.render("newTicket", {
      pageTitle: "Ziploll: New Ticket",
      user: user[0].name,
      user_id: user[0].id,
      projects: projs,
      users: users,
      categories: cat
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.post("/newTicket", secured(), async function(req, res) {
  let conn;
  const insertQuery = sql.insertNewTicket(req.body.ticket_title, req.body.ticket_description, req.body.severity, req.body.project, req.body.category, getDateTime(), req.body.created_by);
  try {
    conn = await pool.getConnection();
    const results = conn.query(insertQuery);
    const id = await conn.query(sql.getCreatedTicket);
    res.redirect('/ticket/' + id[0].id);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.get("/ticket/:ticknum", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  const reqTicket = req.params.ticknum;
  const ticketQ = sql.findTicket(reqTicket);
  const notesQ = sql.getTicketNotes(reqTicket);
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(sql.getCurrentUser(userProfile.user_id));
    let results = await conn.query(ticketQ);
    let users = await conn.query(sql.getTicketAuth);
    let cat = await conn.query(sql.getTicketCategories);
    let status = await conn.query(sql.getStatus);
    let notes = await conn.query(notesQ);
    let severity = await conn.query(sql.getSeverity);
    res.render("ticket", {
      pageTitle: "Ziploll: Ticket #" + reqTicket + " " + results[0].title,
      user: user[0].name,
      user_id: user[0].id,
      results: results[0],
      users: users,
      ticketCategories: cat,
      status: status,
      severity: severity,
      notes: notes
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.post("/ticket", secured(), async function(req, res) {
  let conn;
  const updateTicketQuery = sql.updateTicket(req.body.ticket_title, req.body.ticket_description, req.body.severity, req.body.assigned_to, req.body.status, req.body.ticket_category, getDateTime(), req.body.ticket_value);
  if (req.body.new_note != "") {
    const insertNote = sql.addNote(req.body.ticket_value, getDateTime(), req.body.created_by, req.body.new_note);
    try {
      conn = await pool.getConnection();
      let updateTicket = conn.query(updateTicketQuery);
      let updateNotes = conn.query(insertNote);
      res.redirect('/ticket/' + req.body.ticket_value);
    } catch (err) {
      throw err;
    } finally {
      if (conn) return conn.release();
    }
  } else {
    try {
      conn = await pool.getConnection();
      let updateTicket = conn.query(updateTicketQuery);
      res.redirect('/ticket/' + req.body.ticket_value);
    } catch (err) {
      throw err;
    } finally {
      if (conn) return conn.release();
    }
  }
});


// Other Functions

const getDateTime = () => {
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date + ' ' + time;
  return dateTime;
};
const objFormater = (count, id, keyType, value) => '\"' + count + '\": {\"id\":\"'  + id + '\", \"' + keyType + '\":\"'  + value + '}'
