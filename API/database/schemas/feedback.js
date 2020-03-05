const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema(
  {
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

module.exports = feedbackSchema;
