const mongoose = require('mongoose');
const preferenceSchema = require('../schemas/preference');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/***
 * retunr user preference
 * @param id
 * @returns {Promise}
 */

preferenceSchema.statics.getUserPreferenceByID = function(id) {
  return this.model('Preference')
    .findOne({
      userID: id,
    })
    .exec();
};

/***
 * return user preference
 * @param id
 * @returns {Promise|Array|{index: number, input: string}|*}
 */

preferenceSchema.statics.getUserSelectedPreferenceByID = function(id) {
  return this.model('Preference')
    .find(
      {
        userID: id,
      },
      '-_id',
    )
    .select('type')
    .exec();
};

/***
 *
 * @param condition
 * @param limit
 * @returns {Promise|Array|{index: number, input: string}|*}
 */

preferenceSchema.statics.getUserPreferences = function(condition, limit) {
  return this.model('Preference')
    .find(condition)
    .limit(limit)
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//
/***
 * create user preference
 * @param preference
 */

preferenceSchema.statics.createPreference = function(preference) {
  return this.model('Preference').create({
    userID: preference.userID,
    type: {
      bar: preference.type.bar,
      hotel: preference.type.hotel,
      restaurant: preference.type.restaurant,
    },
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

/***
 * edit user preference
 * @param id
 * @param document
 * @param options
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
preferenceSchema.statics.editPreferenceByID = function(id, document, options) {
  return this.model('Preference')
    .update(
      {
        userID: id,
      },
      document,
      options,
    )
    .exec();
};

//=======================================================================//
//     DELETE                                                            //
//=======================================================================//

/***
 * delete user preferenece
 * @param id
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
preferenceSchema.statics.deletePreferenceByID = function(id) {
  return this.model('Preference')
    .remove({
      userID: id,
    })
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

module.exports = mongoose.model('Preference', preferenceSchema);
