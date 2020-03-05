/**
 * Created by chihabe on 01/11/17.
 */

const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    authorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: String,
    placeID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Place',
    }, // _id de place
    rating: {
      type: Number,
      required: true,
    },
    message: String,
  },
  {
    timestamps: true,
  },
);

module.exports = reviewSchema;
