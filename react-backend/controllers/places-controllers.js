const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const fs = require("fs");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  //req.params holds and object with the keys named in our routes' parameters
  const placeId = req.params.placeId;
  //const place = DUMMY_PLACES.find((place) => placeId === place.id);
  let place;
  try {
    //findById is static method (class method), so is used directly in the constructor function, and not by an instance of place class
    //findById does not return a real promise; but if we add exec(), it does
    place = await Place.findById(placeId).exec();
  } catch (error) {
    return next(
      //this error occurs if something is wrong with the req: the error below is thrown is the req is fine but no place was found
      new HttpError(
        "Something went wrong. Could not find a place for the provided id.",
        500
      )
    );
  }

  if (!place) {
    //both throw new Error() or call next() (only next() works for async code) triggers error middleware defined in app.js;
    /*  const error = new Error("Could not find a place for the provided id.");
      error.code = 404; */

    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    ); //or  throw error, here no need to return because throw cancels function execution
    //return res.status(404).json({message: 'Could not find a place for the provided id.'});
  }

  //place.toObject() converts mongoose object into a js object
  //getters: true allows to set an id property, because mongoose has an id getter
  //that converts object id to string; this getters are lost when toObject() is called; but if set to true, this is avoid
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.userId;
  //const places = DUMMY_PLACES.filter((place) => userId === place.creator);

  //let places; //this code is an alternative to the use of populate()
  let userWithPlaces;
  try {
    //populate allows to check in the referenced db of User (places), and query places using user's places property returning the
    //corresponding places objects; populates takes the reference (id) of places defined in users, and populates user.places with
    //the corresponding places objects
    userWithPlaces = await User.findById(userId).populate("places");

    //places = await Place.find({ creator: userId }).exec();
  } catch (error) {
    return next(
      new HttpError(
        "Fetching places failed. Could not find places for this user.",
        500
      )
    );
  }

  if (!userWithPlaces || userWithPlaces.length === 0) {
    /*  (!places || places.length === 0) */ return next(
      new HttpError("Could not find places for this user.", 404)
    );
  }
  /*   res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  }); */
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  //validationResult analysis req and check its validation, based on the check() configuration
  //in the places route; returns an errors object, which has several details
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(new HttpError("Invalid inputs. Please check your data.", 422));
  }
  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    creator: req.userData.userId, //better than extract the FE creator that can be faked; thus use the id get form token
    image: req.file.path,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId); // to check if the user id already exists in DB
  } catch (error) {
    return next(new HttpError("Creating place failed. Please try again.", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for the provided id.", 404));
  }

  try {
    //transation to performed independent operations as a single one; if some fails, everything is rollback
    // for transactions, the collection must already be created, it does not create one, as occur without transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session }); //here save takes an object where we declare that session is the one we declared above

    //push is not the push for arrays, is a mongoose method that allows to add a place to others already existent
    //only add placeId
    user.places.push(newPlace);
    await user.save({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError("Creating place failed. Please try again.", 500));
  }
  /*   const newPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  }; 

  DUMMY_PLACES = [...DUMMY_PLACES, newPlace];*/
  res.status(201).json({ place: newPlace });
};

const editPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs. Please check your data.", 422));
  }

  const placeId = req.params.placeId;
  const { title, description } = req.body;

  //to get a copy of this object, update the values and only then the array is updated
  /*  const updatedPlace = {
    ...DUMMY_PLACES.find((place) => placeId === place.id),
  };
  const updatedPlaceIndex = DUMMY_PLACES.findIndex(
    (place) => placeId === place.id
  ); */

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId).exec();
  } catch (error) {
    return next(
      new HttpError("Something went wrong. Could not update the place.", 500)
    );
  }

  //in checkAuth middleware, after verifying token validity, we add userId to the req; Here we can verify if the 
  //authenticated user that made the req is the author/creator of this place, and only in this case, the update proceeds
  if (updatedPlace.creator.toString() !== req.userData.userId) {//to string because we get the id as a mongoose object 
    return next(
      new HttpError("You are not allowed to edit this place.", 401)
    );
  }

  updatedPlace.title = title;
  updatedPlace.description = description;

  //DUMMY_PLACES[updatedPlaceIndex] = updatedPlace;
  try {
    await updatedPlace.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong. Could not update the place.", 500)
    );
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.placeId;
  //const placeToDelete = DUMMY_PLACES.find((place) => placeId === place.id);
  let placeToDelete;

  try {
    //populate allows to refer and object in other collection and work with it; requires a connection,
    //the ref prop defined in the models; in this case, we add creator as arg, as the prop we want to check and mongoose takes creator value
    //of placeToDelete and searches for it in user db, getting the corresponding user object
    placeToDelete = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong. Could not delete the place.", 500)
    );
  }

  /*   if (!placeToDelete) {
    throw new HttpError("Could not find a place for that id.", 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((place) => placeId !== place.id); */

  const imagePath = placeToDelete.image;

  if (!placeToDelete) {
    return next(new HttpError("Could not find place for this id.", 404));
  }

  //here the id getter with populate already gives id as string, in creator object
  if (placeToDelete.creator.id !== req.userData.userId) {
    return next(
      new HttpError("You are not allowed to delete this place.", 401)
    );
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await placeToDelete.remove({ session });
    //place.creator, thanks to the populate nad ref, gives us the user object related to this place
    //pull removes the id from the places array
    placeToDelete.creator.places.pull(placeToDelete);
    await placeToDelete.creator.save({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Something went wrong. Could not delete the place.", 500)
    );
  }

  fs.unlink(imagePath, error => console.log(error));

  res.status(200).json({ message: "Deleted place." });
};

/* exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId; */

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  editPlace,
  deletePlace,
};
