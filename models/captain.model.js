// Backend/models/captain.model.js
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const captainSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, "firstname must be at least 3 characters"],
    },
    lastname: {
      type: String,
      minlength: [3, "lastname must be at least 3 characters"],
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "password must be at least 6 characters"],
    select: false, // prevent returning password by default
  },
  socketId: { type: String },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  vehicle: {
    color: {
      type: String,
      required: true,
      minlength: [3, "color must be at least 3 characters"],
    },
    plate: {
      type: String,
      required: true,
      unique: true,
      minlength: [3, "plate must be at least 3 characters"],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "capacity must be at least 1"],
    },
    vehicleType: {
      type: String,
      enum: ["bike", "car", "auto"],
      required: true,
    },
  },
 location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point"
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true
  }
}

});
captainSchema.index({ location: "2dsphere" });

// 🔑 Methods
captainSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
};

captainSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// static method for hashing
captainSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const CaptainModel = mongoose.model("Captain", captainSchema);
module.exports = CaptainModel;
