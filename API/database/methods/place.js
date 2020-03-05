const mongoose = require('mongoose');
const placeSchema = require('../schemas/place');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * Get Place by ID
 * @param id
 * @returns {Promise}
 */
placeSchema.statics.getPlaceByID = function(id) {
  return this.model('Place')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get places (All places if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of places - Promise<Array<Place>>
 */
placeSchema.statics.getPlaces = function(condition, limit) {
  return this.model('Place')
    .find(condition)
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

/**
 * Get Place by Lo, La
 * @param longitude
 * @param latitude
 * @returns {Promise}
 */

placeSchema.statics.getPlaceByCoordinate = function(longitude, latitude) {
  return this.model('Place')
    .find({
      longitude: longitude,
      latitude: latitude,
    })
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//

/**
 * Create a place
 *
 * @param placeID: string
 * @param name: string
 * @param formattedAddress: string
 * @param location: array ([<longitude>, <latitude>])
 * @param openingHours: array of strings
 * @param phone: string
 * @param priceLevel: number
 * @param rating: number
 * @param googleRating: number
 * @param types: string
 * @param url: string
 * @param website: string
 * @param lastRequest: date
 *
 * @return {Promise<Place>} - created place
 */
placeSchema.statics.createPlace = function(object) {
  return this.model('Place').create({
    placeID: object.placeID,
    name: object.name || null,
    formattedAddress: object.formattedAddress || null,
    location: object.location || null,
    openingHours: object.openingHours || null,
    phone: object.phone || null,
    priceLevel: object.priceLevel,
    rating: object.rating,
    googleRating: object.googleRating,
    types: object.types || null,
    url: object.url || null,
    website: object.website || null,
    lastRequest: object.lastRequest || null,
    subs: [],
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

/**
 * Edit place that match with the condition
 *
 * (required) id: Pinty place ID (_id)
 * (required) document: Object like {userName: 'new username'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
placeSchema.statics.editPlaceByID = function(id, document, options) {
  return this.model('Place')
    .update(
      {
        _id: id,
      },
      document,
      options,
    )
    .exec();
};

//=======================================================================//
//     DELETE                                                            //
//=======================================================================//

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

/**
 * Check if place exist (return place if exist OR false)
 *
 * (require) id: google place ID
 *
 * Return Promise<Place|false>
 */
placeSchema.statics.placeExistByPlaceID = function(id) {
  return this.model('Place')
    .findOne({
      placeID: id,
    })
    .exec();
};

module.exports = mongoose.model('Place', placeSchema);
