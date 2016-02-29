'use strict'
var express      = require('express');
var users        = express.Router();
var bodyParser   = require('body-parser');
var db           = require('../db/pg');






// user index
users.route('/')
.get( (req, res) => {
  res.sendStatus(200);
})
// create new user
.post(db.createUser, (req, res) => {
  res.redirect('/users/login'); // change route to logged in page
})

// show new user form
users.get('/new', (req, res) => {
  res.render('users/new',{
    user: req.session.user
  });
});

// show login user form
users.get('/login', (req, res) => {
  res.render('users/login',{
    user: req.session.user
  });
});
// login user and save session
users.post('/login', db.loginUser, (req, res, err) => {
  req.session.user = res.rows;
  req.session.save(() => {
    res.redirect('/missions');
  });
});
// delete user session on logout
users.delete('/logout', (req, res) => {
  req.session.destroy( (err) => {
    res.redirect('/');
  });
});


module.exports = users;