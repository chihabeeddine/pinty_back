const mongoose = require('mongoose');
const iasuggestionSchema = require('../schemas/iasuggestion');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * Get iasuggestion by ID
 *
 * (required) id: iasuggestion ID
 *
 * Return a iasuggestion - Promise<IASuggestion>
 */
iasuggestionSchema.statics.getIASuggestionByID = function(id) {
  return this.model('IASuggestion')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get iasuggestions (All iasuggestions if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of iasuggestions - Promise<Array<IASuggestion>>
 */
iasuggestionSchema.statics.getIASuggestion = function(condition, limit) {
  return this.model('IASuggestion')
    .find(condition)
    .limit(limit)
    .exec();
};

/**
 * Get iasuggestions order by creation date - descending (All iasuggestions if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of iasuggestions - Promise<Array<IASuggestion>>
 */
iasuggestionSchema.statics.getIASuggestionOrderByDesc = function(condition, limit) {
  return this.model('IASuggestion')
    .find(condition)
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

/**
 * Get iasuggestions in array of placeIDs order by creation date - descending
 *
 * (required) ids: array of placeIDs
 * (optional) limit: Number
 *
 * Return array of iasuggestions - Promise<Array<IASuggestion>>
 */
iasuggestionSchema.statics.getIASuggestionIn = function(ids, limit) {
  return this.model('IASuggestion')
    .find({
      placeID: {
        $in: ids,
      },
    })
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//

/**
 * Create an iasuggestion
 *
 * (required) authorID: Author ID
 * (required) placeID: Place ID
 * (optional) note: number
 *
 * Return created iasuggestion - Promise<IASuggestion>
 */
iasuggestionSchema.statics.createIASuggestion = function(iasuggestion) {
  return this.model('IASuggestion').create({
    placeID: iasuggestion.placeID,
    userID: iasuggestion.userID,
    googlePlaceID: iasuggestion.googlePlaceID,
    type: iasuggestion.type,
    note: iasuggestion.note || null,
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

/**
 * Edit iasuggestion that match with the condition
 *
 * (required) id: iasuggestion ID
 * (required) document: Object like {note: 1}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
iasuggestionSchema.statics.editIASuggestionByID = function(id, document, options) {
  return this.model('IASuggestion')
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

/**
 * Delete iasuggestion by id
 *
 * (required) id: iasuggestion ID
 *
 * Return Promise<CommandResult>
 */
iasuggestionSchema.statics.deleteIASuggestionByID = function(id) {
  return this.model('IASuggestion')
    .remove({
      _id: id,
    })
    .exec();
};

/**
 * Delete iasuggestion (All iasuggestion if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 *
 * Return Promise<CommandResult>
 */
iasuggestionSchema.statics.deleteIASuggestions = function(condition) {
  return this.model('IASuggestion')
    .remove(condition)
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

module.exports = mongoose.model('IASuggestion', iasuggestionSchema);
