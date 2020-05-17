const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, //unique s an index for email, so it speeds up the query process
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }], //an user can have an []places
});

//to check if the email is unique in our DB
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
