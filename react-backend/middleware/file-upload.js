const multer = require("multer");
const { v4: uuid } = require('uuid');

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

//fileUpload has several middleware,; we call one pex calling fileUpload.single('image'),
const fileUpload = multer({
  limits: 500000, //bytes
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images"); //cb(error, destination path)
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, `${uuid()}.${ext}`); //cb(error, filename)
    },
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      let error = isValid ? null : new Error("Invalid mime type.");
      cb(error, isValid);
    },
  }),
});

module.exports = fileUpload;
