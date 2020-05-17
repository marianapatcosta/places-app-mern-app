const axios = require("axios");
const API_KEY = process.env.LOCATION_API_KEY;
const HttpError = require("../models/http-error");

const getCoordsForAddress = async (address) => {
  const response = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${API_KEY}`

    //`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  );
  const data = response.data;

  if (!data || data.features.length === 0) {
    throw new HttpError(
      "Could not find location for the specified address.",
      422
    );
  }

  const coordinates = {
    lat: response.data.features[0].center[1],
    lng: response.data.features[0].center[0],
  };

  return coordinates;
};

module.exports = getCoordsForAddress;
