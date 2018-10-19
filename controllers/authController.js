//Format of Token
//Authorization: Token <access_token>

//verify token
function verifyToken(req, res, next) {
    //get the auth header
    const tokenHeader = req.headers['authorization'];
    //check if token is undefined.
    console.log(tokenHeader);
    if (typeof tokenHeader !== 'undefined') {
      //split at the space
      const split = tokenHeader.split(' ');
      //get token from array
      const token = split[1];
      //set the token
      req.token = token;
      //next middleware
      next();
    } else {
      //Forbidden
      res.status(403).json({
        ResponseMsg: 'Forbidden',
        ResponseFlag: 'F'
      });
    }
}

module.exports = {
    verifyToken
}