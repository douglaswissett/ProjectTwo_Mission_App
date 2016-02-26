'use strict'
var express      = require('express');
var missions     = express.Router();
var bodyParser   = require('body-parser');
var db           = require('../db/pg');


missions.route('/')
.get( (req,res) => {
  res.render('pages/log_home', {
    user: req.session.user
  });
})





missions.get('/new', (req, res) => {
  res.render('pages/log_new', {
    user: req.session.user,
  });
});





missions.get('/all', (req, res) => {
  res.render('pages/log_all', {
    user: req.session.user
  });
});




missions.delete('/users/logout', (req, res) => {
  req.session.destroy( (err) => {
    res.redirect('/');
  });
});





module.exports = missions;