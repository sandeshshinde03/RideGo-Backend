//Backend\services\ride.service.js
const rideModel = require("../models/ride.model");
const mapService = require("./maps.service");
const captainModel = require("../models/captain.model");
const crypto = require("crypto");
const bcrypt = require('bcrypt');

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Missing pickup or destination coordinates");
  }

  // Get distance and time from map service
  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  const distanceKm = distanceTime.distance.value / 1000; // meters → km
  const durationMin = distanceTime.duration.value / 60; // seconds → minutes

  // Fare calculation
  const fare = {
    auto: Math.round(30 + distanceKm * 10 + durationMin * 2),
    car: Math.round(50 + distanceKm * 15 + durationMin * 2),
    bike: Math.round(20 + distanceKm * 8 + durationMin * 1.5),
  };

  return fare;
}
module.exports.getFare = getFare;
function getOtp(num) {
  const otp = crypto
    .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
    .toString();
  return otp;
}


module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All  fields required");
  }
  const fare = await getFare(pickup, destination);

  const ride = rideModel.create({
    user,
    pickup,
    destination,
    otp: getOtp(6),
    fare: fare[vehicleType],
  });
  return ride;
};

module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'accepted',
        captain: captain._id
    })

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;

}

module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'ongoing'
    })

    return ride;
}

module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'ongoing') {
        throw new Error('Ride not ongoing');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'completed'
    })

    return ride;
}