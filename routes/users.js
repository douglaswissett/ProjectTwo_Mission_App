'use strict'
var express      = require('express');
var users        = express.Router();
var bodyParser   = require('body-parser');
var db           = require('../db/pg');







users.route('/')
.get( (req, res) => {

  res.sendStatus(200);

})
.post(db.createUser, (req, res) => {
  res.redirect('/'); // change route to logged in page
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

users.post('/login', db.loginUser, (req, res) => {
  req.session.user = res.rows;

   // when you redirect you must force a save due to asynchronisity
   // https://github.com/expressjs/session/issues/167 **
   // "modern web browsers ignore the body of the response and so start loading
   // the destination page well before we finished sending the response to the client."

  req.session.save(() => {
    res.redirect('/missions');
  });
});

users.delete('/logout', (req, res) => {
  req.session.destroy( (err) => {
    res.redirect('/');
  });
});


module.exports = users;