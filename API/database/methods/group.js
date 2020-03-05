const mongoose = require('mongoose');
const groupSchema = require('../schemas/group');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * get Group by id
 * @param type
 * @returns {Promise}
 */
groupSchema.statics.getGroupById = function(id) {
  return this.model('Group')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get Group by author
 * @param author
 * @returns {Promise}
 */
groupSchema.statics.getGroupByAuthor = function(author) {
  return this.model('Group')
    .findOne({
      author: author,
    })
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//

/**
 * create Group
 * @param groupType
 * @param author
 * @returns {*|Promise|Object}
 */
groupSchema.statics.createGroup = function(groupType, author) {
  return this.model('Group').create({
    groupType,
    author,
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

//=======================================================================//
//     DELETE                                                            //
//=======================================================================//

/**
 * Delete group by id
 * @param id
 * @returns {Promise}
 */
groupSchema.statics.deleteGroupByID = function(id) {
  return this.model('Group')
    .findByIdAndRemove(id)
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

module.exports = mongoose.model('Group', groupSchema);
