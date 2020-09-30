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
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
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
  database: process.env.MARIADB_DATABASE
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

const getCurrentUser = ` SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name, email, phone, ext, address_1, address_2, city, state, country, zipcode, contact_pref, user_type FROM users WHERE`;
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
  const getMyTickets = `
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
    WHERE t.user_id = `;
const getProjects = `
  SELECT id, project_name
  FROM proj;`;
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
const getMyCount = `SELECT COUNT(t.id) AS count FROM tickets t INNER JOIN users u ON t.user_id = u.id WHERE u.auth0_id = \'`;


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
app.get("/dashboard", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  const myCount = getMyCount + userProfile.user_id + '\';';
  try {
    conn = await pool.getConnection();
    let openTickets = await conn.query(getTickets);
    const user = await conn.query(getCurrentUser + ' auth0_id = \'' + userProfile.user_id + '\';');
    const openCount = await conn.query(getOpenCount);
    const myCountQuery = await conn.query(myCount);
    res.render("dashboard", {
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
    const user = await conn.query(getCurrentUser + ' auth0_id = \'' + userProfile.user_id + '\';');
    const myTickets = await conn.query(getMyTickets + user[0].id + ' ORDER BY t.id DESC;');
    res.render("assignedtome", {
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
app.get("/profile/:user", secured(), async function(req, res){
  const { _raw, _json, ...userProfile } = req.user;
  const requestedUser = req.params.user;
  const userQuery = getCurrentUser + ' id = ' + requestedUser + ';';
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(getCurrentUser + ' auth0_id = \'' + userProfile.user_id + '\';');
    const searchUserProfile = await conn.query(userQuery);
    res.render("profile", {
      user: user[0].name,
      user_id: user[0].id,
      userProfile: searchUserProfile[0]
    });
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.get("/newTicket", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(getCurrentUser + ' auth0_id = \'' + userProfile.user_id + '\';');
    let projs = await conn.query(getProjects);
    let users = await conn.query(getTicketAuth);
    let cat = await conn.query(getTicketCategories);
    res.render("newTicket", {
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
  const insertQuery = 'INSERT INTO tickets SET title = \'' + req.body.ticket_title + '\', description = \'' + req.body.ticket_description + '\', severity = ' + req.body.severity + ',  proj_id = ' + req.body.project + ', assigned_to = 1, status = 1, ticket_category = ' + req.body.category + ', created_timestamp = \'' + getDateTime() + '\', created_by = ' + req.body.created_by + ';';
  try {
    conn = await pool.getConnection();
    let results = conn.query(insertQuery);
    res.redirect('/dashboard');
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});
app.get("/newProject", secured(), async function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query(getCurrentUser + ' auth0_id = \'' + userProfile.user_id + '\';');
    let categories = await conn.query(getCategories);
    res.render("newProject", {
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
  const insertQuery = 'INSERT INTO proj SET project_name = \'' + req.body.project_name + '\', project_description = \'' + req.body.project_description + '\', category = ' + req.body.category + ', created_timestamp = \'' + getDateTime() + '\', created_by = ' + req.body.created_by + ';';
  try {
    conn = await pool.getConnection();
    let results = conn.query(insertQuery);
    res.redirect('/dashboard');
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
    const user = await conn.query(getCurrentUser + ' auth0_id = \'' + userProfile.user_id + '\';');
    let results = await conn.query(ticketQ);
    let users = await conn.query(getTicketAuth);
    let cat = await conn.query(getTicketCategories);
    let status = await conn.query(getStatus);
    let notes = await conn.query(notesQ);
    let severity = await conn.query(getSeverity);
    res.render("ticket", {
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
  const updateTicketQuery = 'UPDATE tickets SET title = \'' + req.body.ticket_title + '\', description = \'' + req.body.ticket_description + '\', severity = ' + req.body.severity + ', assigned_to = ' + req.body.assigned_to+', status = ' + req.body.status + ', ticket_category = ' + req.body.ticket_category + ', lastupdate_timestamp = \'' + getDateTime() + '\' WHERE id = ' + req.body.ticket_value + ';';
  if (req.body.new_note != "") {
    const insertNote = 'INSERT INTO ticket_notes SET ticket_id = ' + req.body.ticket_value + ', created_timestamp = \'' + getDateTime() + '\', created_by = ' + req.body.created_by + ', note = \'' + req.body.new_note + '\';';
    try {
      conn = await pool.getConnection();
      let updateTicket = conn.query(updateTicketQuery);
      let updateNotes = conn.query(insertNote);
      res.redirect('/dashboard');
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
