const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
  {
    placeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
    },
    authorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: String,
    content: String,
    start: Number,
    end: Number,
    medias: [String],
  },
  {
    timestamps: true,
  },
);

module.exports = eventSchema;
