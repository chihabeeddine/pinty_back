/**
 * Created by chihabe on 01/11/17.
 */

const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    userName: String,
    firstName: {
      type: String,
      required: true,
    },
    lastName: String,
    image: String,
    role: {
      type: String,
      default: 'USER',
    },
    gender: {
      type: String,
      required: true,
    },
    birthDay: Date,
    email: String,
    accessToken: {
      type: String,
      required: true,
    },
    userAPIKey: {
      type: String,
      required: true,
    },
    accessType: {
      type: String,
      required: true,
    },
    city: String,
    description: String,
    adminOf: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
    ],
    subPlaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
    ],
    pendingReview: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    userPreference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Preference',
    },
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = userSchema;
