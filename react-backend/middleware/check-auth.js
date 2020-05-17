const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const checkAuth = (req, res, next) => {
  //By default, for any requests that are not 'GET?, the browser send an OPTIONS req before send the actual req to sen 
  //(POST, DELETE, etc), to check if server accepts the method to be sent
  if (req.method === "OPTIONS") {
    //allows OPTIONS req to continue, then the actual req with POST, DELETE, etc will be send and verified by the middleware
    return next(); 
  }
  try {
    //tokens can be send in query params or headers, which leaves url cleaner and token can be considered metadata
    //to the headers (headers are case-insensitive); if authorization is no set, this can failed so we use try/catch
    const token = req.headers.authorization.split(" ")[1]; //Authorization: 'Bearer Token
    if (!token) {
      throw new Error("Authorization failed.");
    }
    //to verify if the token is valid, if yes, the user is authenticated, we add data to the req and call next()
    // if verification fails, verify) throw an error that should be catch
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError("Authorization failed.", 403));
  }
};

module.exports = checkAuth;
