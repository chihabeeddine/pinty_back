const mongoose = require('mongoose');

const newsSchema = mongoose.Schema(
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
    medias: [String],
  },
  {
    timestamps: true,
  },
);

module.exports = newsSchema;
