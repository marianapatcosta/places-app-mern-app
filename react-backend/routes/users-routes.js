//this file registers middleware responsible for handling routers for users

const express = require("express");
const { check } = require("express-validator");
const { getUsers, signup, login } = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", getUsers);

router.post(
  "/signup",
  //multi middleware is called before any other middleware; we are expecting an 'image' key in the incoming req
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  signup
);

router.post("/login", login);

module.exports = router;
