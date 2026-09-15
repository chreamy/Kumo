const mongoose = require("mongoose");

let connectPromise = null;
let loggedConnectFailure = false;

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function defaultGuildSettings(guildId) {
  return {
    _id: guildId,
    prefix: "!",
    pingEveryone: false,
    channelId: null,
    pingRoleId: null,
  };
}

function connectMongo() {
  if (!process.env.MONGO_URI) {
    if (!loggedConnectFailure) {
      console.warn("MONGO_URI is not set — running without MongoDB.");
      loggedConnectFailure = true;
    }
    return Promise.resolve(false);
  }

  if (isDbReady()) {
    return Promise.resolve(true);
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = mongoose
    .connect(process.env.MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    })
    .then(() => {
      console.log("Connected to MongoDB");
      loggedConnectFailure = false;
      return true;
    })
    .catch((err) => {
      if (!loggedConnectFailure) {
        console.error("MongoDB connection error:", err.message || err);
        loggedConnectFailure = true;
      }
      connectPromise = null;
      return false;
    });

  return connectPromise;
}

module.exports = {
  connectMongo,
  isDbReady,
  defaultGuildSettings,
};
