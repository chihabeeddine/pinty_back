const mongoose = require('mongoose');
const messageSchema = require('../schemas/message');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * Get message by ID
 *
 * (required) id: Message ID
 *
 * Return message - Promise<Message>
 */
messageSchema.statics.getMessageByID = function(id) {
  return this.model('Message')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get messages (All messages if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of messages - Promise<Array<Message>>
 */
messageSchema.statics.getMessages = function(condition, limit) {
  return this.model('Message')
    .find(condition)
    .limit(limit)
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//

/**
 * Create a message
 *
 * (required) message: Text message
 * (required) author: Author ID
 * (required) destination: Destination ID
 *
 * Return created message - Promise<Message>
 */
messageSchema.statics.createMessage = function(message, author, destination) {
  return this.model('Message').create({
    message,
    author,
    destination,
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

/**
 * Edit message that match with the condition
 *
 * (required) id: Message ID
 * (required) document: Object like {message: 'new message'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
messageSchema.statics.editMessageByID = function(id, document, options) {
  return this.model('Message')
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
 * Edit messages that match with the condition
 *
 * (required) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (required) document: Object like {message: 'new message'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
messageSchema.statics.editMessages = function(condition, document, options) {
  return this.model('Message')
    .updateMany(condition, document, options)
    .exec();
};

//=======================================================================//
//     DELETE                                                            //
//=======================================================================//

/**
 * Delete message by id
 *
 * (required) id: Message ID
 *
 * Return Promise<CommandResult>
 */
messageSchema.statics.deleteMessageByID = function(id) {
  return this.model('Message')
    .remove({
      _id: id,
    })
    .exec();
};

/**
 * Delete messages (All messages if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 *
 * Return Promise<CommandResult>
 */
messageSchema.statics.deleteMessages = function(condition) {
  return this.model('Message')
    .remove(condition)
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

module.exports = mongoose.model('Message', messageSchema);
