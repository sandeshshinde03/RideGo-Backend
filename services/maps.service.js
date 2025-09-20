//backend/services/maps.service.js
const axios = require("axios");
const captainModel = require("../models/captain.model");


// Get coordinates from MapTiler Geocoding API
module.exports.getAddressCoordinate = async (address) => {
  const apiKey = process.env.MAPTILER_API_KEY;
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return {lng,lat };
    } else {
      throw new Error("No coordinates found for the given address");
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    throw new Error("Failed to fetch coordinates");
  }
};

// Convert seconds to human-readable duration
function formatDuration(seconds) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);

  let parts = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  return parts.join(" ") || "0 minutes";
}

// Convert meters to km string
function formatDistance(meters) {
  return `${(meters / 1000).toFixed(2)} km`;
}

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) throw new Error("Origin and destination are required");

  try {
    // 1️⃣ Get coordinates
    const originCoord = await module.exports.getAddressCoordinate(origin);
    const destCoord = await module.exports.getAddressCoordinate(destination);

    // 2️⃣ Try OSRM first (with timeout + retry)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoord.lng},${originCoord.lat};${destCoord.lng},${destCoord.lat}?overview=simplified&geometries=geojson`;

    let response;
    try {
      response = await axios.get(osrmUrl, { timeout: 10000 }); // 10s timeout
    } catch (err) {
      console.warn("OSRM request failed, retrying once...", err.message);
      await new Promise(r => setTimeout(r, 2000)); // wait 2s before retry
      response = await axios.get(osrmUrl, { timeout: 10000 });
    }

    const data = response.data;
    if (data.code !== "Ok" || data.routes.length === 0) {
      throw new Error("No route found from OSRM");
    }

    const route = data.routes[0];
    return {
      status: "OK",
      distance: {
        text: formatDistance(route.distance),
        value: Math.round(route.distance), // in meters
      },
      duration: {
        text: formatDuration(route.duration),
        value: Math.round(route.duration), // in seconds
      },
      provider: "OSRM",
    };

  } catch (osrmError) {
    console.error("Error in OSRM getDistanceTime:", osrmError.message);

    // 3️⃣ Fallback to Mapbox Directions API
    try {
      if (!process.env.MAPBOX_TOKEN) throw new Error("MAPBOX_TOKEN is missing in .env");

      const originCoord = await module.exports.getAddressCoordinate(origin);
      const destCoord = await module.exports.getAddressCoordinate(destination);

      const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoord.lng},${originCoord.lat};${destCoord.lng},${destCoord.lat}?geometries=geojson&access_token=${process.env.MAPBOX_TOKEN}`;

      const response = await axios.get(mapboxUrl, { timeout: 10000 });
      const route = response.data.routes[0];

      return {
        status: "OK",
        distance: {
          text: formatDistance(route.distance),
          value: Math.round(route.distance),
        },
        duration: {
          text: formatDuration(route.duration),
          value: Math.round(route.duration),
        },
        provider: "Mapbox",
      };
    } catch (mapboxError) {
      console.error("Error in Mapbox fallback:", mapboxError.message);
      throw new Error("Both OSRM and Mapbox failed to calculate distance/time");
    }
  }
};


module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) throw new Error("Query is required");

  const apiKey = process.env.MAPTILER_API_KEY;
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(input)}.json?key=${apiKey}&autocomplete=true`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.features && data.features.length > 0) {
      return data.features.map((feature) => ({
        name: feature.place_name,
        coordinates: feature.geometry.coordinates,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error.message);
    throw error;
  }
};

module.exports.getCaptainsInTheRedius = async (lng, lat, radiusKm = 10, filter = {}) => {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    throw new Error("Invalid coordinates passed to getCaptainsInTheRedius");
  }

  const captains = await captainModel.find({
    location: {   
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000 // convert km → meters
      }
    },
    ...filter // ✅ apply additional filter like { status: "active" }
  });

  return captains;
};

