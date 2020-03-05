const mongoose = require('mongoose');
const feedbackSchema = require('../schemas/feedback');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * Get feedback by ID
 *
 * (required) id: feedback ID
 *
 * Return a feedback - Promise<Feedback>
 */
feedbackSchema.statics.getFeedbackByID = function(id) {
  return this.model('Feedback')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get feedbacks (All feedbacks if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of feedbacks - Promise<Array<Feedbacks>>
 */
feedbackSchema.statics.getFeedbacks = function(condition, limit) {
  return this.model('Feedback')
    .find(condition)
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

/**
 * Get feedbacks order by creation date - descending (All feedbacks if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of feedbacks - Promise<Array<Feedbacks>>
 */
feedbackSchema.statics.getFeedbacksOrderByDesc = function(condition, limit) {
  return this.model('Feedback')
    .find(condition)
    .sort('-createdAt')
    .limit(limit)
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//

/**
 * Create an feedback
 *
 * (required) authorID: Author ID
 * (required) title: text
 * (required) content: text
 *
 * Return created feedback - Promise<Feedback>
 */
feedbackSchema.statics.createFeedback = function(feedback) {
  return this.model('Feedback').create({
    authorID: feedback.authorID,
    title: feedback.title,
    content: feedback.content,
    medias: [],
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

/**
 * Edit feedback that match with the condition
 *
 * (required) id: Feedback ID
 * (required) document: Object like {content: 'new content'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
feedbackSchema.statics.editFeedbackByID = function(id, document, options) {
  return this.model('Feedback')
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
 * Delete feedback by id
 *
 * (required) id: Feedback ID
 *
 * Return Promise<CommandResult>
 */
feedbackSchema.statics.deleteFeedbackByID = function(id) {
  return this.model('Feedback')
    .remove({
      _id: id,
    })
    .exec();
};

/**
 * Delete feedbacks (All feedbacks if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 *
 * Return Promise<CommandResult>
 */
feedbackSchema.statics.deleteFeedbacks = function(condition) {
  return this.model('Feedback')
    .remove(condition)
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

module.exports = mongoose.model('Feedback', feedbackSchema);
