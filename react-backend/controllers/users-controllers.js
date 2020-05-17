const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  //res.status(200).json({ users: DUMMY_USERS });
  let users;
  try {
    //{} as 1st agr retrieves all the users
    //users = User.find({}, 'email name').exec(); //'email name' as 2nd arg allows to retrieve only email and name
    users = await User.find({}, "-password").exec(); //"-password" as 2nd arg allows to retrieve only email and name, removing password
  } catch (error) {
    return next(
      new HttpError("Fetching users failed. Please try again later.", 500)
    );
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please check your data.", 422));
  }

  const { name, email, password } = req.body;
  /*   const hasUser = DUMMY_USERS.find((user) => email === user.email);
  if (hasUser) {
    throw new HttpError("Could not create user, email already exists", 422);
  } */

  let existingUser;
  try {
    //findOne finds one document matching our criteria; we are already checking if the email exists with userSchema.plugin(uniqueValidator);
    // but the error returned is very technical so here we simplified the error message to send to the user
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(
      new HttpError("Signing up failed. Please try again later.", 500)
    );
  }
  if (existingUser) {
    return next(
      new HttpError("The user already exists. Please login instead.", 422)
    );
  }
  //DUMMY_USERS = [...DUMMY_USERS, newUser];

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(
      new HttpError("Signing up failed. Please try again later.", 500)
    );
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(
      new HttpError("Signing up failed. Please try again later.", 500)
    );
  }

  let token;
  try {
    //sign does not return a promise but can also fail
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_KEY, //key that only server knows and is never shared
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError("Signing up failed. Please try again later.", 500)
    );
  }

  //res.status(201).json({ user: newUser.toObject({ getters: true }) });
  res.status(201).json({ userId: newUser.id, email: newUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  /* const user = DUMMY_USERS.find((user) => email === user.email);
  if (!user || user.password !== password) {
    throw new HttpError(
      "Could not find user. Credentials seem to be wrong.",
      401
    );
  } */
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(
      new HttpError("Logging in failed. Please try again later.", 500)
    );
  }

  if (!existingUser) {
    return next(
      new HttpError("Invalid credentials. Could not log you in.", 403)
    );
  }

  let isValidPassword = false;
  try {
    //compare compares plain text password with hashed password and returns a boolean; never returns an error;
    //if comparison fails returns false, so we have to add another if statement to access password validity
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(
      new HttpError("Invalid credentials. Could not log you in.", 403)
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Invalid credentials. Could not log you in.", 403)
    );
  }

  let token;
  try {
    //sign does not return a promise but can also fail
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY, //key that only server knows and is never shared
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError("Invalid credentials. Could not log you in.", 401)
    );
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token,
  });
};

module.exports = {
  getUsers,
  signup,
  login,
};
