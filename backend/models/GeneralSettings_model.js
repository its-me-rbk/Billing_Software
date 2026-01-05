const mongoose =require("mongoose");

const GeneralSettingsSchema = new mongoose.Schema(
  {
    pharmacyName: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    openingTime: {
      type: String, // HH:mm
    },
    closingTime: {
      type: String, // HH:mm
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GeneralSettings", GeneralSettingsSchema);
