const mongoose = require('mongoose');
const mediaSchema = require('../schemas/media');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * Get media by ID
 *
 * (required) id: media ID
 *
 * Return message - Promise<Media>
 */
mediaSchema.statics.getMediaByID = function(id) {
  return this.model('Media')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get medias (All medias if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of medias - Promise<Array<Media>>
 */
mediaSchema.statics.getMedias = function(condition, limit) {
  return this.model('Media')
    .find(condition)
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

/**
 * Get author
 * @param
 * @returns {Promise}
 */
mediaSchema.statics.getMediaAuthor = function(author) {
  return this.model('Media')
    .findOne({
      author: author,
    })
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//

/**
 * Create Media
 * @param filePath
 * @param author
 * @param reviewID
 * @param placeID
 * @param type
 * @param height
 * @param width
 * @param size
 * @returns {Object|*|Promise}
 */
mediaSchema.statics.createMedia = function(document) {
  return this.model('Media').create({
    filePath: document.filePath,
    authorID: document.authorID,
    reviewID: document.reviewID,
    placeID: document.placeID,
    type: document.type,
    height: document.height,
    width: document.width,
    size: document.size,
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

//=======================================================================//
//     DELETE                                                            //
//=======================================================================//

/**
 * Delete media by id
 *
 * (required) id: Media ID
 *
 * Return Promise<CommandResult>
 */
mediaSchema.statics.deleteMediaByID = function(id) {
  return this.model('Media')
    .remove({
      _id: id,
    })
    .exec();
};

/**
 * Delete medias (All medias if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 *
 * Return Promise<CommandResult>
 */
mediaSchema.statics.deleteMedias = function(condition) {
  return this.model('Media')
    .remove(condition)
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

module.exports = mongoose.model('Media', mediaSchema);
