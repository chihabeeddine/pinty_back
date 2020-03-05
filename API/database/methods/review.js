const mongoose = require('mongoose');
const reviewSchema = require('../schemas/review');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * Get review by ID
 *
 * (required) id: Review ID
 *
 * Return review - Promise<Review>
 */
reviewSchema.statics.getReviewByID = function(id) {
  return this.model('Review')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get reviews (All reviews if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of reviews - Promise<Array<Review>>
 */
reviewSchema.statics.getReviews = function(condition, limit) {
  return this.model('Review')
    .find(condition)
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

/**
 * Get Friends Reviews By Place with friend list
 *
 * (required) friendIDs: Array of user IDs
 * (required) placeID: Place ID
 *
 * Return array of userIDs - Promise<Array<id>>
 */
reviewSchema.statics.getFriendsReviewsByPlace = function(friendIDs, placeID) {
  return this.model('Review')
    .find({
      placeID: placeID,
      authorID: {
        $in: friendIDs,
      },
    })
    .distinct('authorID')
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//

/**
 * Create a review
 *
 * (required) authorID: Author ID
 * (optional) message: text
 * (required) rating: note
 * (required) placeID: Place ID
 *
 * Return created review - Promise<Review>
 */
reviewSchema.statics.createReview = function(review) {
  return this.model('Review').create({
    authorID: review.authorID,
    type: 'pinty',
    placeID: review.placeID,
    rating: review.rating,
    message: review.message,
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

/**
 * Edit review that match with the condition
 *
 * (required) id: Review ID
 * (required) document: Object like {legend: 'new legend'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
reviewSchema.statics.editReviewByID = function(id, document, options) {
  return this.model('Review')
    .update(
      {
        _id: id,
      },
      document,
      options,
    )
    .exec();
};

/**
 * Edit reviews that match with the condition
 *
 * (required) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (required) document: Object like {legend: 'new legend'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
reviewSchema.statics.editReview = function(condition, document, options) {
  return this.model('Review')
    .updateMany(condition, document, options)
    .exec();
};

//=======================================================================//
//     DELETE                                                            //
//=======================================================================//

/**
 * Delete review by id
 *
 * (required) id: Review ID
 *
 * Return Promise<CommandResult>
 */
reviewSchema.statics.deleteReviewByID = function(id) {
  return this.model('Review')
    .remove({
      _id: id,
    })
    .exec();
};

/**
 * Delete reviews (All reviews if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 *
 * Return Promise<CommandResult>
 */
reviewSchema.statics.deleteReviews = function(condition) {
  return this.model('Review')
    .remove(condition)
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

// Fonctions comme getAuthorID etc.. (A faire uniquement si besoin)

module.exports = mongoose.model('Review', reviewSchema);
