const mongoose = require('mongoose');
const userSchema = require('../schemas/user');
const placeSchema = require('../schemas/place');

//=======================================================================//
//     GET                                                               //
//=======================================================================//

/**
 * Get user by ID
 *
 * (required) id: User ID
 *
 * Return user - Promise<User>
 */
userSchema.statics.getUserByID = function(id) {
  return this.model('User')
    .findOne({
      _id: id,
    })
    .exec();
};

/**
 * Get users (All users if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (optional) limit: Number
 *
 * Return array of users - Promise<Array<User>>
 */

userSchema.statics.getUsers = function(condition, limit) {
  return this.model('User')
    .find(condition)
    .limit(limit)
    .exec();
};

/**
 * Search users
 *
 * query: Search query ex: 'jean' (will search %jean%)
 *
 * Return array of users - Promise<Array<User>>
 */

userSchema.statics.searchUsers = function(query) {
  return this.model('User')
    .find({
      $or: [
        {
          userName: {
            $regex: Server.fn.api.regexCaseAccentInsensitive(query),
            $options: 'i',
          },
        },
        {
          firstName: {
            $regex: Server.fn.api.regexCaseAccentInsensitive(query),
            $options: 'i',
          },
        },
        {
          lastName: {
            $regex: Server.fn.api.regexCaseAccentInsensitive(query),
            $options: 'i',
          },
        },
      ],
    })
    .exec();
};

/**
 * return list of tokens without the _id
 * @returns {Promise}
 */

userSchema.statics.getTokenList = function() {
  return this.model('User')
    .find({}, { _id: 0, accessToken: 1 })
    .exec();
};

/**
 * return a list of user friends IDs
 * @param id
 * @returns {Promise}
 */

userSchema.statics.getFriendsIDList = function(id) {
  return this.model('User')
    .find({ _id: id }, '-_id')
    .select('friends')
    .exec();
};

/**
 *
 * @param ids
 * @returns {Promise|Array|{index: number, input: string}|*}
 */

userSchema.statics.getUserInfo = function(ids) {
  return this.model('User')
    .find({
      _id: {
        $in: ids[0].friends,
      },
    })
    .select('firstName lastName image')
    .exec();
};

/**
 * return list of sub Places
 * @param id
 * @returns {Promise|Array|{index: number, input: string}|*}
 */

userSchema.statics.getSubPlacesIDList = function(id) {
  return this.model('User')
    .find(
      {
        _id: id,
      },
      '-_id',
    )
    .select('subPlaces')
    .exec();
};

/**
 * return list of Pending reviews
 * @param id
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
userSchema.statics.getPendingReviewList = function(id) {
  return this.model('User')
    .find(
      {
        _id: id,
      },
      '-_id',
    )
    .select('pendingReview')
    .exec();
};

/**
 * return name and image of places
 * @param ids
 * @returns {Promise|Array|{index: number, input: string}|*}
 */

userSchema.statics.getSubPlacesInfo = function(ids) {
  return this.model('Place')
    .find({
      _id: {
        $in: ids[0].subPlaces,
      },
    })
    .select('name image')
    .exec();
};

/**
 * return the user type preference
 * @param ids
 * return
 */

userSchema.statics.getUserPreference = function(ids) {
  return this.model('Preference')
    .find({
      userID: {
        $in: ids[0].userPreference,
      },
    })
    .select('type')
    .exec();
};

/**
 * return info of pending review
 * @param ids
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
userSchema.statics.getPendingReviewInfo = function(ids) {
  return this.model('Place')
    .find({
      _id: {
        $in: ids[0].pendingReview,
      },
    })
    .select('name image rating')
    .exec();
};

//=======================================================================//
//     CREATE                                                            //
//=======================================================================//

/**
 * Create a user
 *
 * (required) id: string
 * (required) userName: string
 * (required) firstName: string
 * (required) lastName: string
 * (required) image: string
 * (required) role: string (user or admin atm)
 * (required) gender: male of female
 * (required) birthDay: timestamp
 * (required) accessToken: string
 * (required) userAPIKey: string
 * (required) accessType: facebook or google
 *
 * Return created user - Promise<User>
 */
userSchema.statics.createUser = function(
  id,
  userName,
  firstName,
  lastName,
  image,
  role,
  gender,
  birthDay,
  email,
  accessToken,
  userAPIKey,
  accessType,
) {
  let username = (firstName || '') + (lastName || '');
  if (username == '') username = 'unknown';

  return this.model('User').create({
    id,
    userName: userName || username,
    firstName: firstName,
    lastName: lastName || null,
    image: image || null, // TODO: mettre une l'URL d'une image de base
    role: role || 'USER',
    adminOf: [],
    gender: gender || 'male',
    birthDay: birthDay || null,
    email: email || null,
    city: null,
    description: null,
    accessToken,
    userAPIKey,
    accessType,
    subPlaces: [],
    friends: [],
    userPreference: null,
    groups: [],
  });
};

//=======================================================================//
//     EDIT                                                              //
//=======================================================================//

/**
 * Edit user that match with the condition
 *
 * (required) id: User ID
 * (required) document: Object like {userName: 'new username'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
userSchema.statics.editUserByID = function(id, document, options) {
  return this.model('User')
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
 *
 * @param id
 * @param document
 * @param options
 * @returns {Promise|*|RegExpExecArray}
 */
userSchema.statics.editUserByIDNew = function(id, field, options) {
  return this.model('User')
    .update(
      {
        _id: id,
      },
      {
        $set: {
          userPreference: field,
        },
      },
      options,
    )
    .exec();
};

/**
 * Edit users that match with the condition
 *
 * (required) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 * (required) document: Object like {userName: 'new username'}
 * (optional) options: Object options (check mongoose API)
 *
 * Return Promise<CommandResult>
 */
userSchema.statics.editUsers = function(condition, document, options) {
  return this.model('User')
    .updateMany(condition, document, options)
    .exec();
};

//=======================================================================//
//     DELETE                                                            //
//=======================================================================//

/**
 * Delete user by id
 *
 * (required) id: User ID
 *
 * Return Promise<CommandResult>
 */
userSchema.statics.deleteUserByID = function(id) {
  return this.model('User')
    .remove({
      _id: id,
    })
    .exec();
};

/**
 * Delete users (All users if no condition)
 *
 * (optional) condition: Object like {_id: '5a03fba8ec0bc25fd9dcca43'}
 *
 * Return Promise<CommandResult>
 */
userSchema.statics.deleteUsers = function(condition) {
  return this.model('User')
    .remove(condition)
    .exec();
};

//=======================================================================//
//     OTHER                                                             //
//=======================================================================//

/**
 * Check if user exist (return user if exist OR false)
 *
 * (require) id: user ID
 * (require) type: type of account (facebook or google)
 *
 * Return Promise<User|false>
 */
userSchema.statics.userExist = function(id, type) {
  return this.model('User')
    .findOne({
      id: id,
      accessType: type.toLowerCase(),
    })
    .exec();
};

/**
 * Check if user has permissions (return true OR false)
 *
 * (require) roles: permission roles
 * (require) _id: pinty id
 * (require) userAPIKey: user API key
 *
 * Return Promise<Bool>
 */
userSchema.statics.hasPerm = function(roles, _id, userAPIKey) {
  return new Promise((resolve, reject) => {
    this.model('User')
      .findOne({
        _id,
        userAPIKey,
        role: {
          $in: roles,
        },
      })
      .exec()
      .then(user => {
        if (user && user._id == _id && user.userAPIKey == userAPIKey)
          resolve({
            user,
            canPass: true,
          });
        else
          resolve({
            user,
            canPass: false,
          });
      })
      .catch(err => reject(err));
  });
};

module.exports = mongoose.model('User', userSchema);
