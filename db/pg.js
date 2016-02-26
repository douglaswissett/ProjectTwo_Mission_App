var pg            = require('pg');
var conString     = "postgres://"+process.env.DB_USER+":"+process.env.DB_PASSWORD+"@"+process.env.DB_HOST+"/gomissiondb";
var bcrypt        = require('bcrypt');
var salt          = bcrypt.genSaltSync(10);
var session       = require('express-session');


/* User Authentication/Authorisation */
function loginUser(req,res,next) {
  var email = req.body.email;
  var password = req.body.password;

  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('SELECT * FROM users WHERE email LIKE ($1);', 
      [ email ], 
      function(err, result) {
      done();

      if(err) {
        return console.error('error running query', err);
      }

      if(result.rows.length === 0) {
        res.sendStatus(204).json({ sucess: true, data: 'no content' })
      } else if(bcrypt.compareSync(password, result.rows[0].password_digest)) {
        res.rows = result.rows[0];
        next();
      }
      
    })
  })
}

function createSecure(email, password, callback) {
  // hashing the pasword given by the user at signup
  
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        // this callback saves the user to our databased
        // with the hashed password

          // saveUser(email, hashed)
          callback(email, hash);
      });
  });
}

function createUser(req, res, next) {
  createSecure(req.body.email, req.body.password, saveUser);
  var userName = req.body.name;

  function saveUser(email, hash) {
    pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query('INSERT INTO users (name, email, password_digest) VALUES ($1, $2, $3);', 
        [userName, email, hash], 
        function(err, result) {
        done();

        if(err) {
          return console.error('error running query', err);
        }
        next();
      })
    })
  }
}

module.exports.createUser = createUser;
module.exports.loginUser  = loginUser;