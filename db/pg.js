var pg            = require('pg');
var bcrypt        = require('bcrypt');
var salt          = bcrypt.genSaltSync(10);
var session       = require('express-session');

if(process.env.ENVIRONMENT === 'production') {
  var conString = process.env.DATABASE_URL;  
} else {
  var conString     = "postgres://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+"/gomissiondb";
}

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
        res.render('pages/userError', {
          user: req.session.user
        });
        return;
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

function showAllUsers(req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('SELECT * FROM users', function(err, result) {
      done();

      if(err) {
        return console.error('error running query', err);
      }
      res.rows = result.rows;
      next();
    });
  });
}

function selectMission(req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query("SELECT * FROM sites WHERE location like $1", 
      [`%${req.query.location}%`],
      function(err, result) {
      done();
      
      if(err) {
        return console.error('error running query', err);
      }
      res.rows = result.rows;
      next();
    });
  });  
}

function addMission(req, res, next) {
  var coords = req.body.position.slice(1,-1).split(',');

  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('INSERT INTO sites (name, location, lat, lng) VALUES ($1, $2, $3, $4) RETURNING site_id',
     [req.body.address1, req.body.address2, coords[0], coords[1]],
     function(err, result) {
      done();

      if(err) {
        return console.error('error running query', err);
      }
      res.rows = result.rows[0];
      next();
    });
  });
}

function joinMission(req, res, next) {
  userID = +(req.body.userID);
  siteID = res.rows.site_id;
  
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('INSERT INTO mission (user_id, site_id, completed) VALUES ($1, $2, $3)',
     [ userID, siteID, 'In progress' ],
     function(err, result) {
      done();

      if(err) {
        return console.error('error running query', err);
      }
      next();
    });
  });
}

function showMissions(req, res, next) {
  var userID = req.session.user.user_id;

  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query(`
      SELECT mission_id, users.name, sites.name as objective, sites.location, sites.lat, sites.lng, completed 
      FROM mission LEFT JOIN users 
      ON mission.user_id = users.user_id 
      LEFT JOIN sites 
      ON mission.site_id = sites.site_id
      WHERE mission.user_id = $1;`,
      [userID], 
      function(err, result) {
      done();
      
      if(err) {
        return console.error('error running query', err);
      }
      res.rows = result.rows;
      next();
    });
  });  
}

function getMission(req, res, next) {
  var userID = req.session.user.user_id;
  var mID = req.params.id;
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query(`
      SELECT mission_id, users.name, sites.name as objective, sites.location, sites.lat, sites.lng, completed 
      FROM mission LEFT JOIN users 
      ON mission.user_id = users.user_id 
      LEFT JOIN sites 
      ON mission.site_id = sites.site_id
      WHERE mission.user_id = $1 AND mission_id = $2;`,
      [userID, mID],
      function(err, result) {
      done();
      
      if(err) {
        return console.error('error running query', err);
      }
      res.rows = result.rows[0];
      next();
    });
  }); 
}

function updateMission(req, res, next) {
  var mID = req.body.missionID;

  pg.connect(conString, function(err, client, done) {

    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('UPDATE mission SET completed = $1 WHERE mission_id = $2;',
    [ 'Completed', mID ],
     function(err, result) {
      done();

      if(err) {
        return console.error('error running query', err);
      }
      next();
    });
  });
}

function updateScore(req, res, next) {
  var userID = req.body.userID;

  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('UPDATE users SET score = score + 1 WHERE user_id = $1',
    [userID],
     function(err, result) {
      done();

      if(err) {
        return console.error('error running query', err);
      }
      next();
    });
  });
}

function deleteMission(req, res, next) {
  var mID = req.body.missionID;

  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('DELETE FROM mission WHERE mission_id =' + mID +'',
     function(err, result) {
      done();

      if(err) {
        return console.error('error running query', err);
      }
      next();
    });
  });
}

function updateProfile(req, res, next) {
  var userID = req.body.userID;
  var userName = req.body.userName;
  var userEmail = req.body.email;
  var userPassword = req.body.password;
  createSecure(userEmail, userPassword, saveProfile);

  function saveProfile(email, hash) {
    pg.connect(conString, function(err, client, done) {

      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query('UPDATE users SET name = $1, email = $2, password_digest = $3 WHERE user_id = $4;',
      [ userName, email, hash, userID ],
       function(err, result) {
        done();

        if(err) {
          return console.error('error running query', err);
        }
        next();
      });
    });    
  }
}

module.exports.createUser    = createUser;
module.exports.loginUser     = loginUser;
module.exports.showAllUsers  = showAllUsers;
module.exports.selectMission = selectMission;
module.exports.addMission    = addMission;
module.exports.showMissions  = showMissions;
module.exports.joinMission   = joinMission;
module.exports.getMission    = getMission;
module.exports.updateMission = updateMission;
module.exports.deleteMission = deleteMission;
module.exports.updateProfile = updateProfile;
module.exports.updateScore   = updateScore;