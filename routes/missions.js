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





module.exports = missions;