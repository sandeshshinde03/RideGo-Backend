// Backend/socket.js
const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    //console.log(`Client connected: ${socket.id}`);

    // Join room by userId
    socket.on("join", async (data) => {
      const { userId, userType } = data;
      if (!userId) return;

      socket.join(userId.toString()); // user room

      //console.log(`${userType} ${userId} joined room: ${userId}`);

      // Update socketId in DB (optional)
      if (userType === "user") {
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
      } else if (userType === "captain") {
        await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
      }
    });

    // Update captain location
    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;

      if (!location || !location.lat || !location.lng) {
        return socket.emit("error", { message: "Invalid location data" });
      }

      await captainModel.findByIdAndUpdate(userId, {
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
      });
    });

    socket.on("disconnect", () => {
      //console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// Send message to a user's room
const sendMessageToUser = (userId, event, data) => {
  if (!io) {
    console.log("Socket.io not initialized.");
    return;
  }

  io.to(userId.toString()).emit(event, data);
  //console.log(`Event "${event}" sent to user ${userId}`, data);
};

module.exports = { initializeSocket, sendMessageToUser, io };
