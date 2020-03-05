const mongoose = require('mongoose');

const preferenceSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      administratif: {
        type: Number,
        min: 0,
        max: 5,
      },
      autre: {
        type: Number,
        min: 0,
        max: 5,
      },
      bar: {
        type: Number,
        min: 0,
        max: 5,
      },
      culture: {
        type: Number,
        min: 0,
        max: 5,
      },
      divertissement: {
        type: Number,
        min: 0,
        max: 5,
      },
      hotel: {
        type: Number,
        min: 0,
        max: 5,
      },
      magasin: {
        type: Number,
        min: 0,
        max: 5,
      },
      naturel: {
        type: Number,
        min: 0,
        max: 5,
      },
      restaurant: {
        type: Number,
        min: 0,
        max: 5,
      },
      service: {
        type: Number,
        min: 0,
        max: 5,
      },
      transport: {
        type: Number,
        min: 0,
        max: 5,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = preferenceSchema;

/* type: {
            restaurant: Number,
            /*naturel: Number,*/
/*bar: Number/*,
hotel: Number,
divertissement: Number,
culture: Number,
transport: Number,
magasin: Number,
administratif: Number,
service: Number*/
/*}*/
