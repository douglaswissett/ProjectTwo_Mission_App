require('dotenv').config();
pry = require('pryjs')

'use strict'
var express          = require('express');
var path             = require('path');
var logger           = require('morgan');
var bodyParser       = require('body-parser');
var methodOverride   = require('method-override');
var reload           = require('reload');
var session          = require('express-session');
var pgSession        = require('connect-pg-simple')(session);
var pg               = require('pg');
var conString        = "postgres://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+"/gomissiondb";
var db               = require('./db/pg');
var app              = express();

var userRoutes    = require(path.join(__dirname, 'routes/users'));
var missionRoutes = require(path.join(__dirname, 'routes/missions'));

/*Sessions*/
app.use(session({
  store: new pgSession({
    pg        : pg,
    conString : conString,
    tableName : 'session'
  }),
  secret : 'some secret!',
  resave : false,
  cookie : { maxAge : 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

/*Configs*/
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

/*Views*/
app.set('view engine', 'ejs');

/*Public*/
app.use(express.static(path.join(__dirname, 'public')));


/*Routes*/
app.get('/', (req, res) => {
  res.render('pages/home', {
    user: req.session.user
  });
});

app.use('/users', userRoutes);
app.use('/missions', missionRoutes);






var port = process.env.PORT || 3000;
app.listen(port, ()=> {
  console.log('Server running on: ', port, '//', new Date());
});