const getCurrentUser = ` SELECT id, CONCAT_WS(\' \', first_name, last_name) AS name, first_name, last_name, email, phone, ext, address_1, address_2, city, state, country, zipcode,  auth0_id, contact_pref, user_type FROM users WHERE`;
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
const getFeatures = ``;
const getLanguages = ``;
const getSprints = ``;
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
const getMyCount = `SELECT COUNT(t.id) AS count FROM tickets t INNER JOIN users u ON t.assigned_to = u.id WHERE status < 5 AND u.auth0_id = \'`;
const getCreatedTicket = `SELECT MAX(id) AS id FROM tickets;`;
const getCreatedProject = `SELECT MAX(id) AS id  FROM proj;`;
const getCreatedUser = `SELECT MAX(id) AS id  FROM users;`;
const getUserCat = `SELECT * FROM user_cat;`;
const getStates = `SELECT * FROM states;`;

const getProjectById = (projId) => {return `
SELECT p.id p.project_name AS project_name, p.description AS project_description, c.category_name AS category_name, p.created_timestamp AS created_timestamp, CONCAT_WS(\' \', u.first_name, u.last_name) AS created_by, p.lastupdate_timestamp as lastupdate
FROM proj p
INNER JOIN category c
ON p.category = c.id
INNER JOIN users u
ON p.created_by = u.id
WHERE p.id = ` + projId + `;`
};
const getProjectDetails = (projId) => {`
SELECT pf.feature AS feature
FROM proj_features pf
INNER JOIN proj p
ON pf.project_id = p.id
WHERE p.id = ` + projId + `
UNION ALL
SELECT pl.language AS language
FROM proj_languages pl
INNER JOIN proj p
ON pl.project_id = p.id
WHERE p.id = ` + projId + `
UNION ALL
SELECT ps.sprint AS sprint, ps.sprint_num AS sprint_num, ps.is_checked AS is_checked
FROM proj_sprints ps
INNER JOIN proj p
ON ps.project_id = p.id
WHERE p.id = ` + projId + `;`
};
