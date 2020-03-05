/**
 * Created by chihabe on 01/11/17.
 */

const mongoose = require('mongoose');

const placeSchema = mongoose.Schema(
  {
    placeID: String, // Google place id
    name: String,
    formattedAddress: String,
    location: {
      type: [Number], // [<longitude>, <latitude>]
      index: '2d', // create the geospatial index
    },
    image: String,
    openingHours: [String],
    phone: String,
    priceLevel: Number,
    rating: Number,
    googleRating: Number,
    types: String,
    url: String,
    website: String,
    lastRequest: Date,
    subs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = placeSchema;
