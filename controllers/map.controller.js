const mapService = require("../services/maps.service");
const { validationResult } = require("express-validator");

module.exports.getCoordinates = async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.query;

  try {
    // Call service correctly
    const coordinates = await mapService.getAddressCoordinate(address);

    // Send response
    return res.status(200).json(coordinates);
  } catch (error) {
    return res.status(404).json({ message: "Coordinates not found" });
  }
};

module.exports.getDistanceTime = async (req, res, next) => {
  try {
    // 1️⃣ Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { origin, destination } = req.query;

    // 2️⃣ Check required query params
    if (!origin || !destination) {
      return res.status(400).json({ message: "Origin & destination required" });
    }

    // 3️⃣ Get distance & duration from service
    const distanceTime = await mapService.getDistanceTime(origin, destination);

    // 4️⃣ Send response directly (status + distance + duration)
    res.status(200).json(distanceTime);
  } catch (err) {
    console.error("Error in getDistanceTime controller:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAutoCompleteSuggestions = async (req, res, next) => {
  try {
    // 1️⃣ Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { input } = req.query;
    if (!input) return res.status(400).json({ message: "Query is required" });

    // 2️⃣ Call service
    const suggestions = await mapService.getAutoCompleteSuggestions(input);

    // 3️⃣ Send response
    res.status(200).json({ status: "OK", suggestions });
  } catch (error) {
    console.error("Error in getAutoCompleteSuggestions:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};