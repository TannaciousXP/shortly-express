const models = require('../models');
const Promise = require('bluebird');
const db = require('../db');
const utils = require('../lib/hashUtils');

module.exports.createSession = (req, res, next) => {
  // console.log('req.body: ', req.body);
  // let querySelectSalt = 'SELECT salt FROM users WHERE username = ?';
  // db.query(querySelectSalt, req.body.username, (err, results) => {
  //   if (err) {
  //     throw (err);
  //   } else {
  //     if (Object.keys(req.cookie).length === 0) {
  //       req.session = {};
  //     } else {
  //       let hash = utils.createHash(req.body.username, results[0].salt);
  //       req.session = {}; 
  //       req.session.hash = hash;
  //       console.log('REQ SESSION INSIDE CREATE SESSAION: ', req.session);
  //       // next();
        
  //     }   
  //   }    
  // });
  console.log('COOKIE!: ', req.cookies);
  if (Object.keys(req.cookies).length === 0) {
    let hash = utils.createSalt();
    req.session = {}; 
    req.session.hash = hash;   
  }
  
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/


let loggedIn = (boolean) => {
  return boolean;
};

module.exports.authLoginRedirect = ((req, res, next) => {
  // console.log('REQ in AuthLoginRed', )
  if (loggedIn()) {
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

// module.exports.createSession = (req, res, next) => {
//   // query the req
//   console.log('Cookie INFO: ', req.body);
//   let querySelectSalt = 'SELECT salt FROM users WHERE username = ?';
//   db.query(querySelectSalt, req.body.username, (err, results) => {
//     if (err) {
//       throw (err);
//     } else {
//       let cookie = {};
//       cookie.shortlyid = utils.createHash(req.body.username, results[0].salt); 
//       req.headers.Cookie = cookie;     
//     }
    
//   });
  
//   next();
// };
