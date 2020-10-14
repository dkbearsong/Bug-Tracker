CREATE TABLE `tickets` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(30),
  `description` VARCHAR(2000),
  `user_id` INTEGER,
  `severity` INTEGER,
  `proj_id` INTEGER,
  `assigned_to` INTEGER,
  `status` INTEGER,
  `ticket_category` INTEGER,
  `created_timestamp` DATETIME,
  `created_by` INTEGER,
  `lastupdate_timestamp` DATETIME
);

CREATE TABLE `users` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `first_name` VARCHAR(30),
  `last_name` VARCHAR(60),
  `email` VARCHAR(60),
  `phone` INTERGER,
  `ext` INTERGER,
  `address_1` VARCHAR(30),
  `address_2` VARCHAR(30),
  `city` VARCHAR(30),
  `state` VARCHAR(30),
  `country` VARCHAR(40),
  `zipcode` VARCHAR(10),
  `contact_pref` INTEGER,
  `user_type` INTEGER,
  `user_name` VARCHAR(30),
  `auth0_id` VARCHAR(30)
);

CREATE TABLE `ticket_notes` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `ticket_id` INTEGER,
  `created_timestamp` DATETIME,
  `created_by` INTEGER,
  `note` VARCHAR(1000)
);

CREATE TABLE `login_track` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `user_id` INTEGER,
  `login_timestamp` DATETIME,
  `logout_timestamp` DATETIME
);

CREATE TABLE `proj` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `project_name` VARCHAR(30),
  `project_description` VARCHAR(1000),
  `category` INTEGER,
  `created_timestamp` DATETIME,
  `created_by` INTEGER,
  `lastupdate_timestamp` DATETIME
);

CREATE TABLE `category` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `category_name` VARCHAR(30)
);

CREATE TABLE `status` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `status_name` VARCHAR(30)
);

CREATE TABLE `severity` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `severity_name` VARCHAR(50)
);

CREATE TABLE `ticket_cat` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `cat_name` VARCHAR(60)
);

CREATE TABLE `user_cat` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `cat_name` VARCHAR(60)
);

CREATE TABLE `states` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `val` VARCHAR(2),
  `name` VARCHAR(30)
);

CREATE TABLE `proj_features` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `project_id` INTEGER,
  `feature` VARCHAR(1000)
);

CREATE TABLE `proj_languages` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `project_id` INTEGER,
  `language` VARCHAR(50)
);

CREATE TABLE `proj_sprints` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `project_id` INTEGER,
  `sprint` VARCHAR(1000),
  `sprint_num` INTEGER,
  `is_checked` TINYINT(1)
);

ALTER TABLE `tickets` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `tickets` ADD FOREIGN KEY (`severity`) REFERENCES `severity` (`id`);

ALTER TABLE `tickets` ADD FOREIGN KEY (`proj_id`) REFERENCES `proj` (`id`);

ALTER TABLE `tickets` ADD FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`);

ALTER TABLE `tickets` ADD FOREIGN KEY (`status`) REFERENCES `status` (`id`);

ALTER TABLE `tickets` ADD FOREIGN KEY (`ticket_category`) REFERENCES `ticket_cat` (`id`);

ALTER TABLE `tickets` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

ALTER TABLE `users` ADD FOREIGN KEY (`user_type`) REFERENCES `user_cat` (`id`);

ALTER TABLE `ticket_notes` ADD FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`);

ALTER TABLE `ticket_notes` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

ALTER TABLE `login_track` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `proj` ADD FOREIGN KEY (`category`) REFERENCES `category` (`id`);

ALTER TABLE `proj` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

ALTER TABLE `proj_features` ADD FOREIGN KEY (`project_id`) REFERENCES `proj` (`id`);

ALTER TABLE `proj_languages` ADD FOREIGN KEY (`project_id`) REFERENCES `proj` (`id`);

ALTER TABLE `proj_sprints` ADD FOREIGN KEY (`project_id`) REFERENCES `proj` (`id`);
