const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const url =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes.js");
const usersRoutes = require("./routes/users-routes.js");

const app = express();

//this middleware will first parse req body json data to regular js, of every req to the
//objects/arrays, and only after the req goes to the next middleware, the router
app.use(bodyParser.json());

//BE does not allow access to its files. to overcome this to access images stored here, this middleware will filter
//the req with /uploads/images to let the images be send to FE. express.static() returns a middleware that returns 
//the file, which is statically served
app.use("/uploads/images", express.static(path.join('uploads', 'images')));

//middleware that attaches headers to all the responses, to avoid CORS errors
app.use((req, res, next) => {
  //* means will open this api to all the domains
  res.setHeader("Access-Control-Allow-Origin", "*");
  //control which header incoming req can have
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

// => only paths '/api/places/' will reach places routes, the last '/' in defined in router.get(), in placesRoutes
app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

//this middleware will only run if we did not send a response with any of
// the routes declared above
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error; // we can throw because it is sync code
});

//this is the general error handler, that handles the errors that come from the other middleware
//after routes middleware, set a middleware with 4 args, which will be interpreted as error middleware and will run when any
//route in front of them find an error; this function is triggered in routes
app.use((error, req, res, next) => {
  //here we'll handle to remove the img file from our filesystem if any kind of error occurs
  //multer add a prop file to the req, if it has a file
  if (req.file) {
    fs.unlink(req.file.path, (error) => console.log(error));
  }
  if (res.headerSent) {
    //this means check if response has already been sent, if so we forward the error because res had already been sent
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occurred." });
});
//if connection is successful, we start our BE server
mongoose
  .connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(app.listen(process.env.PORT || 5000))
  .catch((error) => console.log(error));
