const { validationResult } = require("express-validator");
const rideService = require("../services/ride.service");
const mapService = require("../services/maps.service");
const { sendMessageToUser } = require("../socket");
const rideModel = require("../models/ride.model");

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType } = req.body;

  try {
    const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
    //console.log("Pickup coordinates:", pickupCoordinates);

    if (
      !pickupCoordinates ||
      isNaN(pickupCoordinates.lat) ||
      isNaN(pickupCoordinates.lng)
    ) {
      return res.status(400).json({ message: "Invalid pickup coordinates" });
    }

    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    const captainsInTheRedius = await mapService.getCaptainsInTheRedius(
      pickupCoordinates.lng,
      pickupCoordinates.lat,
      5000,
      { status: "active" }
    );
    ride.otp = "";
    //console.log("Captains in radius:", captainsInTheRedius);

    const rideWithUser = await rideModel
      .findOne({ _id: ride._id })
      .populate("user");

    captainsInTheRedius.forEach((captain) => {
      sendMessageToUser(captain._id, "new-ride", rideWithUser);
    });

    res.status(201).json({ ride });
  } catch (error) {
    console.error("Error creating ride:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    res.status(200).json({ fare });
  } catch (error) {
    console.error("Error calculating fare:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { rideId } = req.body;

  try {
    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });

    sendMessageToUser(ride.user._id, "ride-confirmed", ride);

    return res.status(200).json({ ride });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    sendMessageToUser(ride.user._id, "ride-started", ride);

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({ rideId, captain: req.captain });

    sendMessageToUser(ride.user._id, "ride-ended", ride);

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
