//backend/Mmodels/ride.model.js
const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  captain: {
    type: mongoose.Types.ObjectId,
    ref: "Captain",
  },
  pickup: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  fare: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Ongoing", "Completed", "Cancelled"],
    default: "Pending",
  },
  duration: {
    type: Number,
  }, //in seconds
  distance: {
    type: Number,
  }, //in meters
  paymentId: {
    type: String,
  },
  orderId: {
    type: String,
  },
  signature: {
    type: String,
  },
  otp: {
    type: String,
    select: false,
    required: true,
  },
});

module.exports = mongoose.model("ride", rideSchema);
