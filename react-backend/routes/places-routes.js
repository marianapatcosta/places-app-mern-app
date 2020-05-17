//this file registers middleware responsible for handling routers for places

const express = require("express");
//check returns a middleware function for our validations requirements; we can chain many of them
const { check } = require("express-validator");

const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const {
  getPlacesByUserId,
  getPlaceById,
  createPlace,
  editPlace,
  deletePlace,
} = require("../controllers/places-controllers");

//router has basically the methods as app ex use(), get()
const router = express.Router();

//the order routes are displayed matters; if we had a route /user, user may be interpreted as a placeId, so /user route
//should be declared before /:placeId so /user code is actually reached
router.get("/:placeId", getPlaceById);

router.get("/user/:userId", getPlacesByUserId);

//by placing here this middleware, the routes above will be opened to everyone, but those following this middleware
//will be filtered by this middleware and only req with valid tokens will be allowed; if token is invalid, the routes
//below will never be reached
router.use(checkAuth);

//after the path, in the http methods, we can declared as many middlewares as we need
// to be target for request api/places/
router.post(
  "/",
  fileUpload.single("image"), //call single middleware to validate the image sent in the createPlace post req
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  createPlace
);

router.patch(
  "/:placeId",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  editPlace
);

router.delete("/:placeId", deletePlace);

module.exports = router;
