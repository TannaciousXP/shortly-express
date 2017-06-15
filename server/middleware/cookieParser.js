const parseCookies = (req, res, next) => {
  if (Object.keys(req.headers).length === 0) {
    req.cookies = {};
  } else {
    let cookieInfo = req.headers.cookie.split('; ');
    req.cookies = {};
    cookieInfo.forEach(cookie => {
      cookie = cookie.split('=');
      req.cookies[cookie[0]] = cookie[1];
    });
  }
  next();
};

module.exports = parseCookies;