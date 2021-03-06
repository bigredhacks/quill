const mongoose = require("mongoose");

/**
 * Settings Schema!
 *
 * Fields with select: false are not public.
 * These can be retrieved in controller methods.
 *
 * @type {mongoose}
 */
const schema = new mongoose.Schema({
    status: String,
    timeOpen: {
        type: Number,
        default: 0, // Date of applications opening
    },
    timeClose: {
        type: Number,
        default: Date.now() + 31104000000, // Add a year from now.
    },
    timeConfirm: {
        type: Number,
        default: 604800000, // Date of confirmation
    },
    whitelistedEmails: {
        type: [String],
        select: false,
        default: [".edu"],
    },
    waitlistText: {
        type: String,
    },
    acceptanceText: {
        type: String,
    },
    confirmationText: {
        type: String,
    },
    allowMinors: {
        type: Boolean,
        default: false,
    },
});

/**
 * Get the list of whitelisted emails.
 * Whitelist emails are by default not included in settings.
 * @param  {Function} callback args(err, emails)
 */
schema.statics.getWhitelistedEmails = function (callback) {
    this.findOne({}).select("whitelistedEmails").exec((err, settings) => callback(err, settings.whitelistedEmails));
};

/**
 * Get the open and close time for registration.
 * @param  {Function} callback args(err, times : {timeOpen, timeClose, timeConfirm})
 */
schema.statics.getRegistrationTimes = function (callback) {
    this.findOne({}).select("timeOpen timeClose timeConfirm").exec((err, settings) => {
        callback(err, {
            timeOpen: settings.timeOpen,
            timeClose: settings.timeClose,
            timeConfirm: settings.timeConfirm,
        });
    });
};

schema.statics.getPublicSettings = function (callback) {
    this.findOne({}).exec(callback);
};

module.exports = mongoose.model("Settings", schema);
