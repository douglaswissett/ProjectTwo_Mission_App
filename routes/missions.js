'use strict'
var express      = require('express');
var missions     = express.Router();
var bodyParser   = require('body-parser');
var db           = require('../db/pg');


// show logged user homepage
missions.route('/')
.get( db.showMissions, (req,res) => {
  console.log(res.rows);
  res.render('pages/log_home', {
    user: req.session.user,
    missionData: res.rows
  });
})
.post( db.addMission, db.joinMission, (req, res) => {
  res.redirect('/missions');
});




// show new mission page
missions.route('/new')
.get( (req, res) => {
  res.render('pages/log_new', {
    user: req.session.user
  });
})




// show all users page
missions.get('/all', db.showAllUsers, (req, res) => {
  res.render('pages/log_all', {
    user: req.session.user,
    userData: res.rows
  });
});



// delete user session on logout
missions.delete('/users/logout', (req, res) => {
  req.session.destroy( (err) => {
    res.redirect('/');
  });
});

// show user profile
missions.route('/profile')
.get( (req, res) => {
  res.render('pages/log_profile', {
    user: req.session.user
  });
})
.put( db.updateProfile, db.loginUser, (req, res) => {
  req.session.user = res.rows;

  req.session.save(() => {
    res.redirect('./');
  });
})

missions.delete('/profile/users/logout', (req, res) => {
  req.session.destroy( (err) => {
    res.redirect('/');
  }); 
})



// show mission detail page
missions.route('/:id')
.get( db.getMission, (req, res) => {

  res.render('pages/log_detail', {
    user: req.session.user,
    missionData: res.rows
  });
})

.put( db.updateMission, db.updateScore, (req, res) => {
  res.redirect('/missions/' + req.body.missionID);
})

.delete( db.deleteMission, (req, res) => {
  res.redirect('/missions');
})




module.exports = missions;