const mongoose = require("mongoose");

const nftVerificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  openseaUsername: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  wallet: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  verifiedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("NftVerification", nftVerificationSchema);
