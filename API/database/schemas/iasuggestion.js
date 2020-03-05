const mongoose = require('mongoose');

const iasuggestionSchema = mongoose.Schema(
  {
    placeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    googlePlaceID: {
      type: String,
    },
    type: {
      type: String,
    },
    note: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
//TODO add type

module.exports = iasuggestionSchema;
