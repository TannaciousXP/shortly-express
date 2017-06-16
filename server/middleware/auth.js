const models = require('../models');
const Promise = require('bluebird');
const db = require('../db');
const utils = require('../lib/hashUtils');

module.exports.createSession = ((req, res, next) => {
  let identifier = req.get('User-Agent');
  
  Promise.resolve(req.cookies.shortlyid)
    .then(hash => {
      if (!hash) {
        throw hash;
      }
      return models.Sessions.get({hash});
    })
    .tap (session => {
      if (!session) {
        throw session;
      }
      if (!models.Sessions.compare(identifier, session.hash, session.salt)) {
        return models.Sessions.delete({hash: session.hash}).throw(identifier);
      }
    })
    .catch( () => {
      return models.Sessions.create(identifier)
        .then(results => {
          return models.Sessions.get({ id: results.insertId });
        })
        .tap(session => {
          res.cookie('shortlyid', session.hash);
        });
    })
    .then(session => {
      req.session = session;
      // console.log('in create session, SESSION: ', req.session);
      req.session.isLoggedIn = false;
      next();
    });
});


/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/


// let isLoggedIn = (boolean) => {
//   return boolean;
// };

module.exports.authLoginRedirect = ((req, res, next) => {
  // console.log('REQ in AuthLoginRed', )
  // console.log('req.session.isLoggedIn', req.session.isLoggedIn);  
  // console.log('req.cookie', req.cookie);

  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
});

module.exports.verifyInfo = ((req, res, next) => {
  let querySelectSalt = 'SELECT * FROM users WHERE username = ?';
  
  db.query(querySelectSalt, req.body.username, (err, results) => {
    if (err) {
      throw (err);
    } else {
      console.log('CHECKING INFO AGAINST USERS TABLE...');
      
      if (results.length === 0) {
        console.log('USERNAME NOT FOUND');
        res.redirect('/login');
      } else {
        
        let hasAccount = models.Users.compare(req.body.password, results[0].password, results[0].salt);
        if (hasAccount) {          
          console.log('ACCOUNT FOUND: ', hasAccount);
          req.session.isLoggedIn = true;
          // console.log('req.session: ', req.session);
          // console.log('req.session.isLoggedIn: ', req.session.isLoggedIn);
          // console.log('req.cookies: ', req.cookies);
          // res.redirect('/index');
          next();        
        } else {
          console.log('PASSWORD NOT FOUND');
          res.redirect('/login');
        }
      }
    }
  });  
});

module.exports.catchDuplicate = (req, res, next) => {
  let querySelectUsername = 'SELECT * FROM users WHERE username = ?';
  db.query(querySelectUsername, req.body.username, (err, results) => {
    if (err) {
      throw (err);
    } else {
      console.log('CHECKING INFO AGAINST USERS TABLE...');
      
      if (results.length === 0) {
        console.log('USERNAME NOT FOUND');
        next();
      } else {
        res.redirect('/signup');
      }
    }
  });  
};

module.exports.createUser = (req, res, next) => {
  models.Users.create({username: req.body.username, password: req.body.password});
  next();
};

module.exports.logout = (req, res, next) => {
  models.Sessions.delete({hash: req.session.hash});
  res.cookies = {};
  next();
};

module.exports.verifySession = (req, res, next) => {
  if (!models.Sessions.isLoggedIn(req.session)) {
    res.redirect('/login');
  } else {
    next();
  }
};

module.exports.updateSession = (req, res, userId) => {
  return models.Sessions.update({ hash: req.session.hash }, { userId: userId });
};

module.exports.destroySession = (req, res) => {
  return models.Sessions.delete({ hash: req.cookies.shortlyid })
    .then(() => {
      res.clearCookie('shortlyid');
    });
};

module.exports.indexRedirect = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
};
