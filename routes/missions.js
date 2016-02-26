'use strict'
var express      = require('express');
var missions     = express.Router();
var bodyParser   = require('body-parser');
var db           = require('../db/pg');


missions.route('/')
.get( db.showMissions, (req,res) => {
  res.render('pages/log_home', {
    user: req.session.user,
    missionData: res.rows
  });
})
.post( db.addMission, (req, res) => {
  console.log(req.body);
  res.redirect('/missions');
});





missions.route('/new')
.get( (req, res) => {
  res.render('pages/log_new', {
    user: req.session.user
  });
})





missions.get('/all', db.showAllUsers, (req, res) => {
  res.render('pages/log_all', {
    user: req.session.user,
    userData: res.rows
  });
});




missions.delete('/users/logout', (req, res) => {
  req.session.destroy( (err) => {
    res.redirect('/');
  });
});





module.exports = missions;