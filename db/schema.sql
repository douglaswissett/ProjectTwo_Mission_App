DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sites;
DROP TABLE IF EXISTS mission;

CREATE TABLE users (
  user_id SERIAL UNIQUE PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  password_digest TEXT
);

CREATE TABLE sites (
  site_id SERIAL UNIQUE PRIMARY KEY,
  name VARCHAR(255),
  location VARCHAR(255),
  points INT
);

CREATE TABLE mission (
  mission_id SERIAL UNIQUE PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  site_id INT REFERENCES sites(site_id) ON DELETE CASCADE,
  completed boolean
);
