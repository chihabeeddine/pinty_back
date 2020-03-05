/**
 * Created by chihabe on 01/11/17.
 */

const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
  {
    groupType: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = groupSchema;
