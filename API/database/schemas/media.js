/**
 * Created by chihabe on 01/11/17.
 */

const mongoose = require('mongoose');

const mediaSchema = mongoose.Schema(
  {
    filePath: {
      type: String,
      required: true,
      unique: true,
    },
    authorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
    placeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
    },
    type: String, // (ex: 'image/png')
    height: Number, // px
    width: Number, // px
    size: Number, // ko
  },
  {
    timestamps: true,
  },
);

module.exports = mediaSchema;
