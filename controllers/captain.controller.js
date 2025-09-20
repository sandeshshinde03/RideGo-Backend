// Backend/controllers/captain.controller.js
const CaptainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");
module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle } = req.body;

  try {
    const isCaptainAlreadyExists = await CaptainModel.findOne({ email });
    if (isCaptainAlreadyExists) {
      return res
        .status(400)
        .json({ message: "Captain with this email already exists" });
    }

    const hashedPassword = await CaptainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
      firstname: fullname.firstname,
      lastname: fullname.lastname,
      email,
      password: hashedPassword,
      color: vehicle.color,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    });

    const token = captain.generateAuthToken();
    res.status(201).json({ captain, token });
  } catch (err) {
    next(err);
  }
};

module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const captain=await CaptainModel.findOne({email}).select("+password");
    if(!captain){
        return res.status(400).json({message:"Invalid email or password"});
    }
    const isMatch=await captain.comparePassword(password);
    if(!isMatch){
        return res.status(400).json({message:"Invalid email or password"});
    }
     const token = captain.generateAuthToken();
     res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'None' });
     captain.password=undefined;
     res.status(200).json({ captain, token });
}

module.exports.getCaptainProfile = async (req, res, next) => {
    res.status(200).json({ captain: req.captain });
}

module.exports.logoutCaptain = async (req, res, next) => {
    const token=req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
    await blacklistTokenModel.create({token});

    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: 'None' });
    res.status(200).json({message:"Logged out successfully"});
}

// Add this new function to your captain controller
module.exports.getActiveCaptains = async (req, res) => {
  try {
    const activeCaptains = await captainModel.find({ status: "active" });
    
    const captainLocations = activeCaptains.map(captain => ({
      id: captain._id,
      name: `${captain.fullname.firstname} ${captain.fullname.lastname || ''}`,
      location: captain.location,
      vehicleType: captain.vehicle.vehicleType,
      socketId: captain.socketId || null
    }));
    
    res.status(200).json({
      count: captainLocations.length,
      captains: captainLocations
    });
  } catch (error) {
    console.error("Error fetching active captains:", error);
    res.status(500).json({ message: error.message });
  }
};
