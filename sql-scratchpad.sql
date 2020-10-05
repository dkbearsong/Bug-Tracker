CREATE USER 'bt-user'@localhost IDENTIFIED BY 'Gc502#Fc476!12Jwe4$sFDa89o132B812J';

GRANT select, insert, update, delete ON bugtracker.* TO 'bt-user'@'localhost';

INSERT INTO users SET first_name = 'Dereck', last_name = 'Bearsong', email='dkbearsong@gmail.com', phone='3036699998', address_1='6500 W. 13th Ave', address_2='431', city='Lakewood', state='CO', country='USA', zipcode='80214', contact_pref=1, user_type=0;
INSERT INTO users SET first_name = 'Test', last_name = 'User', email='none@none.com', phone='3033033030', address_1='123 W. Pennsylvania Ave', address_2='777', city='Englewood', state='CO', country='USA', zipcode='80222', contact_pref=1, user_type=0;

INSERT INTO category SET category_name = 'Professional App';
INSERT INTO category SET category_name = 'Personal App';
INSERT INTO category SET category_name = 'Professional Site';
INSERT INTO category SET category_name = 'Personal Site';

INSERT INTO proj SET project_name = 'Bug Tracker', project_description = 'A bug tracking website built using NodeJS, Express JS, MariaDB, Bootstrap, and the SB Admin 2 Bootstrap template from startbootstrap.com', category = 1, created_timestamp = '12:00:00 09/20/20', created_by = 1;

const ticketStatus = {
  1: 'New',
  2: 'Open',
  3: 'Awaiting Callback',
  4: 'Need Info',
  5: 'Resolved - Works as Expected',
  6: 'Resolved - Issue Corrected',
  7: ' Closed - no Callback'
}

CREATE OR REPLACE TABLE `status` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  status_name VARCHAR(30)
);

INSERT INTO status SET status_name = 'New';
INSERT INTO status SET status_name = 'Open';
INSERT INTO status SET status_name = 'Awaiting Callback';
INSERT INTO status SET status_name = 'Need Info';
INSERT INTO status SET status_name = 'Resolved - Works as Expected';
INSERT INTO status SET status_name = 'Resolved - Issue Corrected';
INSERT INTO status SET status_name = 'Closed - no Callback';

ALTER TABLE `tickets` ADD FOREIGN KEY (`status`) REFERENCES `status` (`id`);

INSERT INTO tickets SET title = 'ejs content not loading', description = 'when going to http://localhost:3000 and any subpage, redirected to a page that gets the header and footer, but none of the content of home.ejs. Verified the body content is missing in developer console but the header and footer partials are there.', user_id = 1, severity = 1, proj_id = 1, assigned_to = 1, status = 6, created_timestamp = '2020-09-22 12:00:00', created_by = 1;
INSERT INTO tickets SET title = '/newticket stuck waiting for local host', description = 'when going to /newTicket, it gets stuck with nothing happening other than “waiting for local host”. Eventually times out with “localhost didn’t send any data. ERR_EMPTY_RESPONSE”', user_id = 1, severity = 3, proj_id = 1, assigned_to = 1, status = 6, created_timestamp = '2020-09-25 12:00:00', created_by = 1;
INSERT INTO tickets SET title = '"created by" section is blank in New Ticket', description = 'when going to “New Ticket” page, the created by section is blank even though there should be 1 result in the database', user_id = 1, severity = 3, proj_id = 1, assigned_to = 1, status = 6, created_timestamp = '2020-09-25 12:00:00', created_by = 1;
INSERT INTO tickets SET title = 'Company Brand icon does not navigate to /', description = '“Company Brand” icon in top of sidebar tries to navigate to “index” instead of to “/”', user_id = 1, severity = 4, proj_id = 1, assigned_to = 1, status = 6, created_timestamp = '2020-09-25 12:00:00', created_by = 1;
INSERT INTO tickets SET title = 'New Tickets not getting CSS styling', description = 'New Tickets page is not getting any CSS styling from custom style sheets, only within the actual contents of the EJS files that aren’t pulling from the partials. Partials are getting CSS styling', user_id = 1, severity = 3, proj_id = 1, assigned_to = 1, status = 6, created_timestamp = '2020-09-25 12:00:00', created_by = 1;
INSERT INTO tickets SET title = 'Need New Project page', description = 'Need to add a “New Project” page to create and add new projects', user_id = 1, severity = 4, proj_id = 1, assigned_to = 1, status = 1, created_timestamp = '2020-09-25 12:00:00', created_by = 1;
INSERT INTO tickets SET title = 'Submit in new ticket does not post', description = ' when clicking “Submit” in New Ticket, it doesn’t post and redirect. Stays stuck on New Ticket page', user_id = 1, severity = 3, proj_id = 1, assigned_to = 1, status = 6, created_timestamp = '2020-09-27 12:00:00', created_by = 1;
INSERT INTO tickets SET title = 'tickets table in dashboard not loading data', description = 'tickets for dashboard load an object, but they do not load up into the grid on the dashboard.ejs', user_id = 1, severity = 3, proj_id = 1, assigned_to = 1, status = 6, created_timestamp = '2020-09-27 12:00:00', created_by = 1;


INSERT INTO ticket_notes SET ticket_id = 4, created_timestamp = '2020-09-22 15:31:00', created_by = 1, note= 'for a brief moment, when switching from localhost:3000 to localhost:300/dashboard, the body of the page showed up in the dev console, however the contents were not displaying. Also if you go to login route, it takes you to the auth0 login page';
INSERT INTO ticket_notes SET ticket_id = 4, created_timestamp = '2020-09-23 10:30:00', created_by = 1, note= 'asked on Programmers Hangout discord about my issue, experimented with the path resolution for express static public folder but this didn’t change the issue. Did suggest checking the folder structure, so experimented with this. Created a test folder and copied alot of core files from the app to separate it. Started disabling files and folders and eventually loaded up with public folder from my personal site as well as views folder, then replaced app.js and package files and loaded the packages. While using all the stuff from my personal site it works, however if I use the same app.js file while switching out the views folder, it’ll show the views the same way it’s showing in my app, so I’m thinking something in the views folder has to be broken. Cut it down now to just my home.ejs file and my header and footer.ejs files, nothing else in the views folder. Still is not working. Maybe if I try to replace the home.ejs with the one from my personal site. Breaks and now doesn’t show any header or footer, but nodemon is still running. Get an error but it’s just about mongoose. Will remove that. Cleared that out and swapped out the header from my personal site, now the content shows up. I think it’s the header file. Yes, once I swapped back to the old home ejs file with the personal site header, it worked.';
INSERT INTO ticket_notes SET ticket_id = 4, created_timestamp = '2020-09-23 10:58:00', created_by = 1, note= 'determined that the problem in the header was that the script tag for auth0 was not terminated. Corrected this and made sure there was a body tag and now it works.';
INSERT INTO ticket_notes SET ticket_id = 5, created_timestamp = '2020-09-25 15:02:00', created_by = 1, note= 'I think this might be because it’s returning an empty promise. This is something I’ve ran into before with async/await and db requests. Testing out cutting it down to creating the connection, running the getProjects query and then console logging it. First found that I had a mistake in getProjects calling it project_id, replaced it with id. Now gives error “UnhandledPromiseRejectionWarning: ReferenceError: users is not defined. I think this is because I don’t have any entries in any of the tables. I’ll need to correct this. ';
INSERT INTO ticket_notes SET ticket_id = 5, created_timestamp = '2020-09-25 15:17:00', created_by = 1, note= 'added self to users table. Still giving “users is not defined”. This is because I have users and projs in the render section as arguments I think. Removing them, can’t remove them since coded into ejs. Will turn the users query on as well. It appears the data is coming in, but when concatonating the first and last name together, comes in as “0” for some reason. Fixed by converting CONCAT to CONCAT_WS. Still not loading the page though. Forgot to turn the render back on Now it comes up, but it doesn’t load it correctly. Looks like this

I must have the code in incorrectly. Textarea tag was not properly closed off. Improved, but still not perfect

I think this is good though and can be marked as closed (NOTE: turning async await functions on seems to cause it to not work anymore, so will leave these off for now)
';
INSERT INTO ticket_notes SET ticket_id = 6, created_timestamp = '2020-09-27 11:02:00', created_by = 1, note= 'trying to console.log my projs and users variable that should be loading in, but nothing is coming up. Tried setting a timeout for 5 seconds but still nothing. Realised now looking in Chrome dev console and not terminal console. Getting the data I’m looking for there.';
INSERT INTO ticket_notes SET ticket_id = 6, created_timestamp = '2020-09-27 11:18:00', created_by = 1, note= 'ser data is coming in like this
[
  { id: 1, name: \'Dereck Bearsong\' },
  { id: 2, name: \'Test User\' },
  meta: [
    ColumnDef {
      _parse: [StringParser],
      collation: [Collation],
      columnLength: 11,
      columnType: 3,
      flags: 16899,
      scale: 0,
      type: \'LONG\'
    },
    ColumnDef {
      _parse: [StringParser],
      collation: [Collation],
      columnLength: 364,
      columnType: 253,
      flags: 0,
      scale: 31,
      type: \'VAR_STRING\'
    }
  ]
]
';
INSERT INTO ticket_notes SET ticket_id = 6, created_timestamp = '2020-09-27 11:50:00', created_by = 1, note= 'Determined the issue was that my variables I was inserting into the ejs file were using <% instead of <%=. Changed this and now works.';
INSERT INTO ticket_notes SET ticket_id = 7, created_timestamp = '2020-09-27 11:02:00', created_by = 1, note= 'Updated href link to point to “/”';
INSERT INTO ticket_notes SET ticket_id = 8, created_timestamp = '2020-09-27 11:53:00', created_by = 1, note= 'CSS styling is working fine';
INSERT INTO ticket_notes SET ticket_id = 10, created_timestamp = '2020-09-27 12:14:00', created_by = 1, note= 'changed the a href to a button that has an action type of “submit”. Stuck at “waiting for local host” and nothing in the console, either chrome or terminal. Verified data did not get submitted. Realize now that I did not put my insert statement into the query';
INSERT INTO ticket_notes SET ticket_id = 10, created_timestamp = '2020-09-27 12:32:00', created_by = 1, note= 'tested the query, some of the data is not set correct in terms of pulling from the req.body so corrected those. Data itself loads up properly now, but still stuck not redirecting and data does not get added to table.';
INSERT INTO ticket_notes SET ticket_id = 10, created_timestamp = '2020-09-27 13:00:00', created_by = 1, note= 'dropping the variable assignment for the insert query and just running the query to see if it will work now. Still does not seem to work. Reassigning to the variable and then running the variable with console.log before the redirect. Nothing has come up yet. Testing out where this is getting stuck by putting a console.log “hello” after pool.getconnection and another after con.query. Get the first hello but not the second. Removing the await from the variable. Now completes, but error in the query itself. Looks like I forgot a \’';
INSERT INTO ticket_notes SET ticket_id = 10, created_timestamp = '2020-09-27 13:11:00', created_by = 1, note= 'after the last correction, had to go through bit by bit of the query to make sure that it is typed correctly and fulfills the foreign key constrains. Now submits, returns back to dashboard, and enters the ticket correctly into the database. ';
INSERT INTO ticket_notes SET ticket_id = 11, created_timestamp = '2020-09-27 14:06:00', created_by = 1, note= 'Forgot to assign the entries within my forEach on the ejs to the callback variable. Now works';



UPDATE ticket_notes SET created_timestamp = '2020-09-22 15:31:00', note= 'for a brief moment, when switching from localhost:3000 to localhost:300/dashboard, the body of the page showed up in the dev console, however the contents were not displaying. Also if you go to login route, it takes you to the auth0 login page' WHERE id = 3;
UPDATE ticket_notes SET created_timestamp = '2020-09-23 10:30:00' WHERE id = 4;
UPDATE ticket_notes SET created_timestamp = '2020-09-23 10:58:00' WHERE id = 5;

INSERT INTO tickets SET title = 'Updating dashboard caused dashboard to get stuck', description = 'after updating dashboard.ejs and app.js to provide a closed tickets query, dashboard gets stuck when reloading with no console.logs', user_id = 1, severity = 3, proj_id = 1, assigned_to = 1, status = 6, created_timestamp = '2020-09-29 08:13:00', created_by = 1;
INSERT INTO tickets SET title = 'expand titles to 60 char', description = 'expand the titles from 30 characters to 60 characters and update existing titles', user_id = 1, severity = 3, proj_id = 1, assigned_to = 1, status = 1, created_timestamp = '2020-09-29 08:17:00', created_by = 1;


INSERT INTO ticket_notes SET ticket_id = 12, created_timestamp = '2020-09-29 08:14:00', created_by = 1, note= 'verified splash screen and login still work. Noticed I had left my console.log in my try pointing to an old variable name that doesn’t exist anymore. This was the problem. Removing this corrected the issue. ';

INSERT INTO ticket_notes SET ticket_id = 14, created_timestamp = '2020-09-29 08:50:00', created_by = 1, note= 'Error about a field not being right was found in the console log. Hadn\'t renamed description to project_description. Should fix this now. ';
UPDATE tickets SET status = 6 WHERE id = 14;





CREATE OR REPLACE TABLE `ticket_cat` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  cat_name VARCHAR(60)
);

ALTER TABLE `tickets` ADD COLUMN (ticket_category INTEGER);
ALTER TABLE `tickets` ADD FOREIGN KEY (`ticket_category`) REFERENCES `ticket_cat` (`id`);

ALTER TABLE `tickets` MODIFY `title` VARCHAR(100);
ALTER TABLE `proj` MODIFY `project_name` VARCHAR(100);

INSERT INTO ticket_cat SET cat_name = 'Bug';
INSERT INTO ticket_cat SET cat_name = 'Enhancement';
INSERT INTO ticket_cat SET cat_name = 'Feature Request';

UPDATE tickets SET status = 5, ticket_category = 1 WHERE id = 8;
UPDATE tickets SET ticket_category = 1 WHERE id IN (4, 5, 6, 7, 10, 11, 12, 14);
UPDATE tickets SET ticket_category = 2 WHERE id IN (9, 13);
UPDATE tickets SET title = '/newticket stuck waiting for local host' WHERE id = 5;
UPDATE tickets SET title = '"created by" section is blank in New Ticket' WHERE id = 6;
UPDATE tickets SET title = 'Company Brand icon does not navigate to /' WHERE id = 7;
UPDATE tickets SET title = 'New Tickets not getting CSS styling' WHERE id = 8;
UPDATE tickets SET title = 'Submit in new ticket does not post' WHERE id = 10;
UPDATE tickets SET title = 'tickets table in dashboard not loading data' WHERE id = 11;
UPDATE tickets SET title = 'Updating dashboard caused dashboard to get stuck' WHERE id = 12;

INSERT INTO ticket_notes SET ticket_id = 15, created_timestamp = '2020-09-29 12:33:00', created_by = 1, note= 'tried putting console log tests in the try for the ticket route, received no logs back. Added console logs to start of route, start of try, and after the connection was created. Those worked. Noticed I did not have a ; at the end of my results query. Adding that and trying again. Still not working';
INSERT INTO ticket_notes SET ticket_id = 15, created_timestamp = '2020-09-29 12:47:00', created_by = 1, note= 'adjusted query to use req.params correctly, before was pointing to the parameter name in the routing path. Still not running query correctly. Trying to take the concatonation expression for findTicket and getTicketNotes out of the actually query execution and putting them in their own constants so can test what they produce when entered, will console log this. Checked the code, took it and ran it in mysql, getting an error near “\'CONCAT_WS(\' \', u2.first_name, u2.last_name) AS created_by_name
  FROM tickets t
\'
Apparently I’m missing a comma there. Saving this and trying again. ';
INSERT INTO ticket_notes SET ticket_id = 15, created_timestamp = '2020-09-29 12:47:00', created_by = 1, note= 'Ticket page now loads and all test logs come in. However CSS styling seems to be completely broken so not resolving yet. Also, apparently ticket data isn’t actually loading up. All other queries are loading up.';
INSERT INTO ticket_notes SET ticket_id = 15, created_timestamp = '2020-09-29 13:01:00', created_by = 1, note= 'the information does in fact load when I put it in mysql, so the issue is not the query. Verifying that the query assignment does produce the data in the object. Confirmed it loads into the object.';
INSERT INTO ticket_notes SET ticket_id = 15, created_timestamp = '2020-09-29 13:13:00', created_by = 1, note= 'fixed CSS styling by adding / before start of path in header.ejs. However, ticket information still not loading. ';
INSERT INTO ticket_notes SET ticket_id = 15, created_timestamp = '2020-09-29 13:30:00', created_by = 1, note= 'Mostly fixed, set the results being passed in through the render assignment to results[0]. Ticket description is still not coming in though. Fixed that by putting <%= results.description %> between the text area tag instead of the value';
UPDATE tickets SET status = 6 WHERE id = 15;

ALTER TABLE `users` ADD COLUMN (user_name VARCHAR(30));
ALTER TABLE `users` ADD COLUMN (auth0_id VARCHAR(30));
UPDATE users SET user_name = 'dkbearsong', auth0_id = 'auth0|5f73911681551f006e425f23' WHERE id = 1;
ALTER TABLE `users` MODIFY `user_name` VARCHAR(30) NOT NULL UNIQUE;
ALTER TABLE `users` MODIFY `auth0_id` VARCHAR(30) UNIQUE;

CREATE OR REPLACE TABLE `user_cat` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  cat_name VARCHAR(60)
);

INSERT INTO  user_cat SET cat_name = 'End User';
INSERT INTO  user_cat SET cat_name = 'Support Rep';
INSERT INTO  user_cat SET cat_name = 'Support Manager';
INSERT INTO  user_cat SET cat_name = 'Developer';
INSERT INTO  user_cat SET cat_name = 'Dev Manager';

CREATE OR REPLACE TABLE `states` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  val VARCHAR(2),
  name VARCHAR(30)
);

INSERT INTO states SET val = 'AL', name = 'Alabama';
INSERT INTO states SET val = 'AK', name = 'Alaska';
INSERT INTO states SET val = 'AZ', name = 'Arizona';
INSERT INTO states SET val = 'AR', name = 'Arkansas';
INSERT INTO states SET val = 'CA', name = 'California';
INSERT INTO states SET val = 'CO', name = 'Colorado';
INSERT INTO states SET val = 'CT', name = 'Connecticut';
INSERT INTO states SET val = 'DE', name = 'Delaware';
INSERT INTO states SET val = 'DC', name = 'District Of Columbia';
INSERT INTO states SET val = 'FL', name = 'Florida';
INSERT INTO states SET val = 'GA', name = 'Georgia';
INSERT INTO states SET val = 'HI', name = 'Hawaii';
INSERT INTO states SET val = 'ID', name = 'Idaho';
INSERT INTO states SET val = 'IL', name = 'Illinois';
INSERT INTO states SET val = 'IN', name = 'Indiana';
INSERT INTO states SET val = 'IA', name = 'Iowa';
INSERT INTO states SET val = 'KS', name = 'Kansas';
INSERT INTO states SET val = 'KY', name = 'Kentucky';
INSERT INTO states SET val = 'LA', name = 'Louisiana';
INSERT INTO states SET val = 'ME', name = 'Maine';
INSERT INTO states SET val = 'MD', name = 'Maryland';
INSERT INTO states SET val = 'MA', name = 'Massachusetts';
INSERT INTO states SET val = 'MI', name = 'Michigan';
INSERT INTO states SET val = 'MN', name = 'Minnesota';
INSERT INTO states SET val = 'MS', name = 'Mississippi';
INSERT INTO states SET val = 'MO', name = 'Missouri';
INSERT INTO states SET val = 'MT', name = 'Montana';
INSERT INTO states SET val = 'NE', name = 'Nebraska';
INSERT INTO states SET val = 'NV', name = 'Nevada';
INSERT INTO states SET val = 'NH', name = 'New Hampshire';
INSERT INTO states SET val = 'NJ', name = 'New Jersey';
INSERT INTO states SET val = 'NM', name = 'New Mexico';
INSERT INTO states SET val = 'NY', name = 'New York';
INSERT INTO states SET val = 'NC', name = 'North Carolina';
INSERT INTO states SET val = 'ND', name = 'North Dakota';
INSERT INTO states SET val = 'OH', name = 'Ohio';
INSERT INTO states SET val = 'OK', name = 'Oklahoma';
INSERT INTO states SET val = 'OR', name = 'Oregon';
INSERT INTO states SET val = 'PA', name = 'Pennsylvania';
INSERT INTO states SET val = 'RI', name = 'Rhode Island';
INSERT INTO states SET val = 'SC', name = 'South Carolina';
INSERT INTO states SET val = 'SD', name = 'South Dakota';
INSERT INTO states SET val = 'TN', name = 'Tennessee';
INSERT INTO states SET val = 'TX', name = 'Texas';
INSERT INTO states SET val = 'UT', name = 'Utah';
INSERT INTO states SET val = 'VT', name = 'Vermont';
INSERT INTO states SET val = 'VA', name = 'Virginia';
INSERT INTO states SET val = 'WA', name = 'Washington';
INSERT INTO states SET val = 'WV', name = 'West Virginia';
INSERT INTO states SET val = 'WI', name = 'Wisconsin';
INSERT INTO states SET val = 'WY', name = 'Wyoming';
