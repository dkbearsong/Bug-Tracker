const escapeRegExp = require('lodash.escaperegexp');

const sql = {
  getCurrentUser: (user) =>
    `SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name, first_name, last_name, email, phone, ext, address_1, address_2, city, state, country, zipcode, auth0_id, contact_pref, user_type
    FROM users
    WHERE auth0_id = \'` + user + `\';`,
  getUser: (user) =>
    `SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name, first_name, last_name, email, phone, ext, address_1, address_2, city, state, country, zipcode,  auth0_id, contact_pref, user_type
    FROM users
    WHERE id = \'` + user + `\';`,
  findTicket: (extra) => `
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
    WHERE t.id = ` + extra + ';',
  getTickets: `
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
    ORDER BY t.id DESC;`,
  getMyTickets: (user) => `
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
    WHERE t.user_id = ` + user + ' ORDER BY t.id DESC;',
  getProjects: `
    SELECT id, project_name
    FROM proj;`,
  getAllProjects: `
    SELECT p.id AS project_id, p.project_name AS project_name, c.category_name AS category_name, CONCAT_WS(\' \', u.first_name, u.last_name) AS created_by, p.created_timestamp AS created_timestamp
    FROM proj p
    INNER JOIN users u
    ON p.created_by = u.id
    INNER JOIN category c
    ON p.category = c.id
    ORDER BY p.id DESC;  `,
  getAllUsers: `
    SELECT u.id AS id, CONCAT_WS(\' \', u.first_name, u.last_name) AS name, u.user_name AS user_name, uc.cat_name AS user_type
    FROM users u
    INNER JOIN user_cat uc
    ON u.user_type = uc.id
    ORDER BY id ASC;`,
  getCategories: 'SELECT * FROM category;',
  getTicketCategories: 'SELECT * FROM ticket_cat;',
  getStatus: 'SELECT * FROM status;',
  getSeverity: 'SELECT * FROM severity',
  getTicketAuth: "SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name FROM users WHERE user_type <> 1 ORDER BY last_name ASC;",
  getUsers: "SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name FROM users;",
  getTicketNotes: (ticket) => `
    SELECT tn.created_timestamp AS created_timestamp, tn.note AS note, CONCAT_WS(\' \', u.first_name, u.last_name) AS author
    FROM ticket_notes tn
    INNER JOIN tickets t
    ON tn.ticket_id = t.id
    INNER JOIN users u
    ON tn.created_by = u.id
    WHERE t.id = ` + ticket + ' ORDER BY created_timestamp DESC;',
  getOpenCount: `SELECT COUNT(*) AS count FROM tickets WHERE status < 5;`,
  getMyCount: (user) => 'SELECT COUNT(t.id) AS count FROM tickets t INNER JOIN users u ON t.assigned_to = u.id WHERE status < 5 AND u.auth0_id = \'' + user + '\';',
  getCreatedTicket: `SELECT MAX(id) AS id FROM tickets;`,
  getCreatedProject: `SELECT MAX(id) AS id  FROM proj;`,
  getCreatedUser: `SELECT MAX(id) AS id  FROM users;`,
  getUserCat: `SELECT * FROM user_cat;`,
  getStates: `SELECT * FROM states;`,
  getProjectById: (projId) => `
    SELECT p.id AS id, p.project_name AS project_name, p.project_description AS project_description, p.category AS category, p.created_timestamp AS created_timestamp, CONCAT_WS(\' \', u.first_name, u.last_name) AS created_by, p.lastupdate_timestamp as lastupdate
    FROM proj p
    INNER JOIN category c
    ON p.category = c.id
    INNER JOIN users u
    ON p.created_by = u.id
    WHERE p.id = ` + projId + `;`,
  getProjectDetails: (projId) => `
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
  ,
  updateProject: (title, description, cat, projId) => `
    UPDATE proj
    SET project_name = \'` + cleanRegX(title) + `\', project_description = \'` + cleanRegX(description) + `\', category = ` + cat + `
    WHERE id = ` + projId + `;`,
  insertNewProfile: (fName, lName, email, phone, extReq, add1, add2, city, state, zip, auth0) => `
    INSERT INTO users
    SET first_name = \'` + cleanRegX(fName) + `\', last_name = \'` + cleanRegX(lName) + `\', email = \'` + email + `\', phone = ` + phone.replace(/-/g, '') + extReq + `, address_1 = \'` + cleanRegX(add1) + `\', address_2 = \'` + cleanRegX(add2) + `\', city = \'` + cleanRegX(city) + `\', state = \'` + state + `\', zipcode = ` + zip + `, auth0_id = \'` + auth0 + `\';`,
  updateProfile: (fName, lName, email, phone, extReq, add1, add2, city, state, zip, auth0, uid) => `UPDATE users
    SET first_name = \'` + cleanRegX(fName) + `\', last_name = \'` + cleanRegX(lName) + `\', email = \'` + email + `\', phone = ` + phone.replace(/-/g, '') + extReq + `, address_1 = \'` + cleanRegX(add1) + `\', address_2 = \'` + cleanRegX(add2) + `\', city = \'` + cleanRegX(city) + `\', state = \'` + state + `\', zipcode = ` + zip + `, auth0_id = \'` + auth0 + `\'
    WHERE id = ` + uid + `;`,
  newProjInsert: (title, desc, cat, timestamp, createdBy) => `
    INSERT INTO proj
    SET project_name = \'` + cleanRegX(title) + `\', project_description = \'` + cleanRegX(desc) + `\', category = ` + cat + `, created_timestamp = \'` + timestamp + `\', created_by = ` + createdBy + `;`,
  insertProjDetails: (id, table, item, extra) => `
    INSERT INTO proj_` + table + `s
    SET project_id = ` + id + `, ` + table + ` = \'` + cleanRegX(item) + `\'` + extra + `; `,
  insertNewTicket: (title, desc, sev, projId, cat, timestamp, createdBy) => `
    INSERT INTO tickets
    SET title = \'` + cleanRegX(title) + `\', description = \'` + cleanRegX(desc) + `\', severity = ` + sev + `,  proj_id = ` + projId + `, assigned_to = 1, status = 1, ticket_category = ` + cat + `, created_timestamp = \'` + timestamp + `\', created_by = ` + createdBy + `;`,
  updateTicket: (title, desc, sev, assignedTo, status, cat, timestamp, id) => `
    UPDATE tickets
    SET title = \'` + cleanRegX(title) + `\', description = \'` + cleanRegX(desc) + `\', severity = ` + sev + `, assigned_to = ` + assignedTo + `, status = ` + status + `, ticket_category = ` + cat + `, lastupdate_timestamp = \'` + timestamp + `\'
    WHERE id = ` + id + `;`,
  addNote: (id, timestamp, createdBy, note) => `
    INSERT INTO ticket_notes
    SET ticket_id = ` + id + `, created_timestamp = \'` + timestamp + `\', created_by = ` + createdBy + `, note = \'` + cleanRegX(note) + `\';`,
  cleanRegX : (item) => escapeRegExp(item).replace(/"/g, '\\\"').replace(/'/g, "\\\'")
};

const cleanRegX = (item) => escapeRegExp(item).replace(/"/g, '\\\"').replace(/'/g, "\\\'");

module.exports = sql;
