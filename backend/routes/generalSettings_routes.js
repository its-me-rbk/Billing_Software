const express = require("express");
const GeneralSettings = require("../models/GeneralSettings_model");

const router = express.Router();

/**
 * CREATE or UPDATE settings
 */
router.post("/save", async (req, res) => {
  try {
    const payload = req.body;

    let settings = await GeneralSettings.findOne();

    if (settings) {
      settings = await GeneralSettings.findByIdAndUpdate(
        settings._id,
        payload,
        { new: true }
      );
    } else {
      settings = await GeneralSettings.create(payload);
    }

    res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save settings",
      error: error.message,
    });
  }
});

/**
 * GET settings
 */
router.get("/get", async (req, res) => {
  try {
    const settings = await GeneralSettings.findOne();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
});

module.exports = router;
