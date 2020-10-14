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
// const sql = require('./lib/sql');
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

// SQL Logic

const getCurrentUser = (user) => 'SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name, first_name, last_name, email, phone, ext, address_1, address_2, city, state, country, zipcode,  auth0_id, contact_pref, user_type FROM users WHERE auth0_id = \'' + user + '\';';
const getUser = (user) => 'SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name, first_name, last_name, email, phone, ext, address_1, address_2, city, state, country, zipcode,  auth0_id, contact_pref, user_type FROM users WHERE id = \'' + user + '\';';
const findTicket = `
  SELECT t.id AS id, t.title AS title, t.description AS description, sv.id AS severity, p.project_name AS project_name, p.project_description AS project_description,c.category_name AS project_category, t.status AS status, t.ticket_category AS ticket_category, t.created_timestamp AS created_timestamp, u1.id AS assigned_to_id, CONCAT_WS(\' \', u2.first_name, u2.last_name) AS created_by_name
  FROM tickets t
  INNER JOIN status st
  ON t.status = st.id
  INNER JOIN severity sv
  ON t.severity = sv.id
  INNER JOIN proj p
  ON t.proj_id = p.id
  INNER JOIN category c
  ON p.category = c.id
  INNER JOIN users u1
  ON t.assigned_to = u1.id
  INNER JOIN users u2
  ON t.created_by = u2.id
  INNER JOIN ticket_cat tc
  ON t.ticket_category = tc.id
  WHERE`;
const findProject = `
  SELECT project_name, project_description, category, created_timestamp, created_by, lastupdate_timestamp
  FROM proj
  WHERE `;
const getTickets = `
  SELECT t.id AS id, t.title AS title, sv.severity_name AS severity, p.project_name AS project_name, st.status_name, tc.cat_name AS category, t.created_timestamp AS created_timestamp
  FROM tickets t
  INNER JOIN status st
  ON t.status = st.id
  INNER JOIN severity sv
  ON t.severity = sv.id
  INNER JOIN proj p
  ON t.proj_id = p.id
  INNER JOIN users u
  ON t.assigned_to = u.id
  INNER JOIN ticket_cat tc
  ON t.ticket_category = tc.id
  ORDER BY t.id DESC;`;
  const getMyTickets = (user) => `
    SELECT t.id AS id, t.title AS title, sv.severity_name AS severity, p.project_name AS project_name, st.status_name, tc.cat_name AS category, t.created_timestamp AS created_timestamp
    FROM tickets t
    INNER JOIN status st
    ON t.status = st.id
    INNER JOIN severity sv
    ON t.severity = sv.id
    INNER JOIN proj p
    ON t.proj_id = p.id
    INNER JOIN users u
    ON t.assigned_to = u.id
    INNER JOIN ticket_cat tc
    ON t.ticket_category = tc.id
    WHERE t.user_id = `  + user + ' ORDER BY t.id DESC;';
const getProjects = `
  SELECT id, project_name
  FROM proj;`;
const getAllProjects = `
  SELECT p.id AS project_id, p.project_name AS project_name, c.category_name AS category_name, CONCAT_WS(\' \', u.first_name, u.last_name) AS created_by, p.created_timestamp AS created_timestamp
  FROM proj p
  INNER JOIN users u
  ON p.created_by = u.id
  INNER JOIN category c
  ON p.category = c.id
  ORDER BY p.id DESC;
  `;
const getAllUsers = `
  SELECT u.id AS id, CONCAT_WS(\' \', u.first_name, u.last_name) AS name, u.user_name AS user_name, uc.cat_name AS user_type
  FROM users u
  INNER JOIN user_cat uc
  ON u.user_type = uc.id;`;
const getCategories = 'SELECT * FROM category;';
const getTicketCategories = 'SELECT * FROM ticket_cat;';
const getStatus = 'SELECT * FROM status;';
const getSeverity = 'SELECT * FROM severity'
const getTicketAuth = "SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name FROM users WHERE user_type <> 1 ORDER BY last_name ASC;";
const getUsers = "SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name FROM users;";
const getTicketNotes = `
SELECT tn.created_timestamp AS created_timestamp, tn.note AS note, CONCAT_WS(\' \', u.first_name, u.last_name) AS author
FROM ticket_notes tn
INNER JOIN tickets t
ON tn.ticket_id = t.id
INNER JOIN users u
ON tn.created_by = u.id
WHERE`;
const getOpenCount = `SELECT COUNT(*) AS count FROM tickets WHERE status < 5;`;
const getMyCount = (user) => 'SELECT COUNT(t.id) AS count FROM tickets t INNER JOIN users u ON t.assigned_to = u.id WHERE status < 5 AND u.auth0_id = \''  + user + '\';';
const getCreatedTicket = `SELECT MAX(id) AS id FROM tickets;`;
const getCreatedProject = `SELECT MAX(id) AS id  FROM proj;`;
const getCreatedUser = `SELECT MAX(id) AS id  FROM users;`;
const getUserCat = `SELECT * FROM user_cat;`;
const getStates = `SELECT * FROM states;`;
const getProjectById = (projId) => {return `
SELECT p.id AS id, p.project_name AS project_name, p.project_description AS project_description, p.category AS category, p.created_timestamp AS created_timestamp, CONCAT_WS(\' \', u.first_name, u.last_name) AS created_by, p.lastupdate_timestamp as lastupdate
FROM proj p
INNER JOIN category c
ON p.category = c.id
INNER JOIN users u
ON p.created_by = u.id
WHERE p.id = ` + projId + `;`
};
const getProjectDetails = (projId) => {return `
  SELECT pf.id AS id, pf.feature AS feature, null AS language, null AS sprint, null AS sprint_num, null AS is_checked
  FROM proj p
  INNER JOIN proj_features pf
  ON p.id = pf.project_id
  WHERE p.id =  ` + projId + `
  UNION
  SELECT pl.id AS id, null AS feature, pl.language AS language, null AS sprint, null AS sprint_num, null AS is_checked
  FROM proj p
  INNER JOIN proj_languages pl
  ON p.id = pl.project_id
  WHERE p.id =  ` + projId + `
  UNION
  SELECT ps.id AS id, null AS feature, null AS language, ps.sprint AS sprint, ps.sprint_num AS sprint_num, ps.is_checked AS is_checked
  FROM proj p
  INNER JOIN proj_sprints ps
  ON p.id = ps.project_id
  WHERE p.id =  ` + projId + `;`
};
const updateProject = (title, description, cat, projId) => 'UPDATE proj SET project_name = \'' + title + '\', project_description = \'' + description + '\', category = ' + cat + ' WHERE id = ' + projId + ';';
const insertNewProfile = (fName, lName, email, phone, extReq, add1, add2, city, state, zip, auth0) => 'INSERT INTO users SET first_name = \'' + fName + '\', last_name = \'' + lName + '\', email = \'' + email + '\', phone = ' + phone.replace(/-/g, '') + extReq + ', address_1 = \'' + add1 + '\', address_2 = \'' + add2 + '\', city = \'' + city + '\', state = \'' + state + '\', zipcode = ' + zip + ', auth0_id = \'' + auth0 + '\';';
const updateProfile = (fName, lName, email, phone, extReq, add1, add2, city, state, zip, auth0, uid) => 'UPDATE users SET first_name = \'' + fName + '\', last_name = \'' + lName + '\', email = \'' + email + '\', phone = ' + phone.replace(/-/g, '') + extReq + ', address_1 = \'' + add1 + '\', address_2 = \'' + add2 + '\', city = \'' + city + '\', state = \'' + state + '\', zipcode = ' + zip + ', auth0_id = \'' + auth0 + '\' WHERE id = ' + uid + ';';
const newProjInsert = (title, desc, cat, timestamp, createdBy) => 'INSERT INTO proj SET project_name = \'' + title + '\', project_description = \'' + desc + '\', category = ' + cat + ', created_timestamp = \'' + timestamp + '\', created_by = ' + createdBy + ';';
const insertProjDetails = (id, table, item, extra) => 'INSERT INTO proj_' + table +'s SET project_id = '+ id + ', ' + table + ' = \'' + cleanRegX(item) +'\''+ extra +'; '

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
  const myCount = getMyCount(userProfile.user_id);
  try {
    conn = await pool.getConnection();
    let openTickets = await conn.query(getTickets);
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    const openCount = await conn.query(getOpenCount);
    const myCountQuery = await conn.query(myCount);
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
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    const myTickets = await conn.query(getMyTickets(user[0].id));
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
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    const allProjects = await conn.query(getAllProjects);
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
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    const allUsers = await conn.query(getAllUsers);
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
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    const categories = await conn.query(getUserCat);
    const statesList = await conn.query(getStates);
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
  const firstName = cleanRegX(req.body.first_name);
  const lastName = cleanRegX(req.body.last_name);
  const address1 = cleanRegX(req.body.address_1);
  const address2 = cleanRegX(req.body.address_2);
  const city = cleanRegX(req.body.city);
  const phone = req.body.phone_number;
  if (req.body.extension != '') {
    extReq = '\', ext = ' + req.body.extension;
  }
  const insertQuery = insertNewProfile(firstName, lastName, req.body.email, phone, extReq, address1, address2, city, req.body.state, req.body.zipcode, req.body.auth0);
  try {
    conn = await pool.getConnection();
    const results = await conn.query(insertQuery);
    const id = await conn.query(getCreatedUser);
    res.redirect('/profile/' + id[0].id);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.get("/profile/:user", secured(), async function(req, res){
  const { _raw, _json, ...userProfile } = req.user;
  const requestedUser = req.params.user;
  const userQuery = getUser(requestedUser);
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    const searchUserProfile = await conn.query(userQuery);
    const statesList = await conn.query(getStates);
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
  const firstName = cleanRegX(req.body.first_name);
  const lastName = cleanRegX(req.body.last_name);
  const address1 = cleanRegX(req.body.address_1);
  const address2 = cleanRegX(req.body.address_2);
  const city = cleanRegX(req.body.city);
  const phone = req.body.phone_number;
  if (req.body.extension != '') {
    extReq = '\', ext = ' + req.body.extension;
  }
  const insertQuery = updateProfile(firstName, lastName, req.body.email, phone, extReq, address1, address2, city, req.body.state, req.body.zipcode, req.body.auth0, req.body.user_id);
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
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    let categories = await conn.query(getCategories);
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
  const projectTitle = cleanRegX(req.body.project_name );
  const projectDesc = cleanRegX(req.body.project_description);
  const projectFeat = JSON.parse(req.body.features);
  const projectLang = JSON.parse(req.body.languages);
  const projectSprints = JSON.parse(req.body.sprints);

  const insertQuery = newProjInsert(projectTitle, projectDesc, req.body.category, getDateTime(), req.body.created_by);
  let insertFeatures = "";
  let insertLanguages = "";
  let insertSprints = "";

  try {
    conn = await pool.getConnection();
    const results = await conn.query(insertQuery);
    const id = await conn.query(getCreatedProject);
    Object.keys(projectFeat).forEach(item => {insertFeatures = insertFeatures.concat(insertProjDetails(id[0].id, 'feature', projectFeat[item]["feature"], ''))});
    Object.keys(projectLang).forEach(item => {insertLanguages = insertLanguages.concat(insertProjDetails(id[0].id, 'language', projectLang[item]["language"], ''))});
    Object.keys(projectSprints).forEach(item => {insertSprints = insertSprints.concat(  insertProjDetails(id[0].id, 'sprint', projectSprints[item]["sprint"], ', sprint_num =' + projectSprints[item]["sprint_num"] + ', is_checked = ' + projectSprints[item]["checked"]))});
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
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    const proj = await conn.query(getProjectById(reqProject));
    const projDesc = await conn.query(getProjectDetails(reqProject));
    let categories = await conn.query(getCategories);
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
  const projectTitle = cleanRegX(req.body.project_name);
  const projectDesc = cleanRegX(req.body.project_description);
  const projectFeat = JSON.parse(req.body.features);
  const projectLang = JSON.parse(req.body.languages);
  const projectSprints = JSON.parse(req.body.sprints);
  const updateQuery = updateProject(projectTitle, projectDesc, req.body.category, req.body.proj_id);
  let updateFeatures = "";
  let updateLanguages = "";
  let updateSprints = "";
  const projUpdate = (action, table, id, item, where) => action + ' proj_' + table + 's SET project_id = ' + id + ', ' + table + ' = \'' + cleanRegX(item) + '\' ' + where + '; ';
  try {
    conn = await pool.getConnection();
    const results = await conn.query(updateQuery);
    const id = await conn.query(getCreatedProject);
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
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    let projs = await conn.query(getProjects);
    let users = await conn.query(getTicketAuth);
    let cat = await conn.query(getTicketCategories);
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
  const ticketTitle = escapeRegExp(req.body.ticket_title).replace(/"/g, '\\\"').replace(/'/g, "\\\'");
  const ticketDesc = escapeRegExp(req.body.ticket_description).replace(/"/g, '\\\"').replace(/'/g, "\\\'");
  const insertQuery = 'INSERT INTO tickets SET title = \'' + ticketTitle + '\', description = \'' + ticketDesc + '\', severity = ' + req.body.severity + ',  proj_id = ' + req.body.project + ', assigned_to = 1, status = 1, ticket_category = ' + req.body.category + ', created_timestamp = \'' + getDateTime() + '\', created_by = ' + req.body.created_by + ';';
  try {
    conn = await pool.getConnection();
    let results = conn.query(insertQuery);
    const id = await conn.query(getCreatedTicket);
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
  const ticketQ = findTicket + ' t.id = ' + reqTicket + ';';
  const notesQ = getTicketNotes + ' t.id = ' + reqTicket + ' ORDER BY created_timestamp DESC;'
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(getCurrentUser(userProfile.user_id));
    let results = await conn.query(ticketQ);
    let users = await conn.query(getTicketAuth);
    let cat = await conn.query(getTicketCategories);
    let status = await conn.query(getStatus);
    let notes = await conn.query(notesQ);
    let severity = await conn.query(getSeverity);
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
  const ticketTitle = escapeRegExp(req.body.ticket_title).replace(/"/g, '\\\"').replace(/'/g, "\\\'");
  const ticketDesc = escapeRegExp(req.body.ticket_description).replace(/"/g, '\\\"').replace(/'/g, "\\\'");
  const updateTicketQuery = 'UPDATE tickets SET title = \'' + ticketTitle + '\', description = \'' + ticketDesc + '\', severity = ' + req.body.severity + ', assigned_to = ' + req.body.assigned_to+', status = ' + req.body.status + ', ticket_category = ' + req.body.ticket_category + ', lastupdate_timestamp = \'' + getDateTime() + '\' WHERE id = ' + req.body.ticket_value + ';';
  if (req.body.new_note != "") {
    const ticketNote = escapeRegExp(req.body.new_note).replace(/"/g, '\\\"').replace(/'/g, "\\\'");
    const insertNote = 'INSERT INTO ticket_notes SET ticket_id = ' + req.body.ticket_value + ', created_timestamp = \'' + getDateTime() + '\', created_by = ' + req.body.created_by + ', note = \'' + ticketNote + '\';';
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
      res.redirect('/dashboard');
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
const cleanRegX = (item) => escapeRegExp(item).replace(/"/g, '\\\"').replace(/'/g, "\\\'")
const objFormater = (count, id, keyType, value) => '\"' + count + '\": {\"id\":\"'  + id + '\", \"' + keyType + '\":\"'  + value + '}'
