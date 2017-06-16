const parseCookies = (req, res, next) => {

  let cookieInfo = req.headers.cookie ? req.headers.cookie.split('; ') : [];
  req.cookies = {};
  cookieInfo.forEach(cookie => {
    cookie = cookie.split('=');
    req.cookies[cookie[0]] = cookie[1];
  });
  next();
};

module.exports = parseCookies;