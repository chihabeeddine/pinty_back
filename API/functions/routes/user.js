//=======================================================================//
//     USER functions                                                    //
//=======================================================================//

module.exports = {
  /* Checkers */

  checkUserPerms(user, id, params) {
    return new Promise((resolve, reject) => {
      // Check perms
      if (user.role == 'ADMIN') return resolve(params);
      else if (user._id.toString() == id.toString()) return resolve(params);
      else reject(Server.fn.api.jsonError(403, 'Forbidden'));
    });
  },

  checkUserPermsPlace(user, placeID, params) {
    return new Promise((resolve, reject) => {
      // Check perms
      if (user.role == 'ADMIN') return resolve(params);
      else if (user.adminOf.find(e => e.toString() == placeID.toString()) != undefined)
        return resolve(params);
      else reject(Server.fn.api.jsonError(403, 'Forbidden'));
    });
  },

  checkRouteProfileID(URLparams) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (URLparams.id && URLparams.id.match(/^[0-9a-fA-F]{24}$/)) resolve(URLparams.id);
      // Check good ObjectID
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing id'));
    });
  },

  checkRouteProfilePending(URLparams) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (URLparams.userID && URLparams.userID.match(/^[0-9a-fA-F]{24}$/))
        resolve(URLparams.userID);
      // Check good ObjectID
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing id'));
    });
  },

  checkRouteEditProfileParameters(URLparams, params) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (
        URLparams.id &&
        URLparams.id.match(/^[0-9a-fA-F]{24}$/) &&
        Object.keys(params).length != 0
      ) {
        // Check good ObjectID
        let user = {
          _id: URLparams.id,
        };

        if (params.username)
          if (params.username.trim() != '') user.userName = params.username;
          else return reject(Server.fn.api.jsonError(400, 'Bad username'));
        if (params.firstname)
          if (params.firstname.trim() != '') user.firstName = params.firstname;
          else return reject(Server.fn.api.jsonError(400, 'Bad firstname'));
        if (params.lastname)
          if (params.lastname.trim() != '') user.lastName = params.lastname;
          else return reject(Server.fn.api.jsonError(400, 'Bad lastname'));
        if (params.gender)
          if (params.gender.toLowerCase() == 'male' || params.gender.toLowerCase() == 'female')
            user.gender = params.gender.toLowerCase();
          else return reject(Server.fn.api.jsonError(400, 'Bad gender'));
        if (params.email)
          if (
            params.email.match(
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            )
          )
            user.email = params.email;
          else return reject(Server.fn.api.jsonError(400, 'Bad email'));
        if (params.city)
          if (params.city.trim() != '') user.city = params.city;
          else return reject(Server.fn.api.jsonError(400, 'Bad city'));
        if (params.description)
          if (params.description.trim() != '') user.description = params.description;
          else return reject(Server.fn.api.jsonError(400, 'Bad city'));
        if (params.birthday) {
          let date = new Date(parseFloat(params.birthday, 10));

          if (date instanceof Date && !isNaN(date.valueOf())) user.birthDay = date;
          else return reject(Server.fn.api.jsonError(400, 'Bad birthday'));
        }
        if (params.image) {
          try {
            const mime = params.image.match(/^data:image\/\w+;base64,[\s\S]+/);
            let noHeader = params.image.split('base64,')[1];

            if (!noHeader)
              return reject(Server.fn.api.jsonError(400, 'Bad image (no header data/mime)'));

            const fileSize = (noHeader.replace(/=/g, '').length * 0.75) / 1000;

            if (Server.base64.isBase64(noHeader) && mime && fileSize <= config.media.maxSize)
              user.image = params.image;
            else return reject(Server.fn.api.jsonError(400, 'Bad image or bad size'));
          } catch (error) {
            return reject(Server.fn.api.jsonError(400, 'Bad image or bad size', error));
          }
        }

        resolve(user);
      } else reject(Server.fn.api.jsonError(400, 'Bad or Missing parameters'));
    });
  },

  checkRouteFriendIDs(URLparams) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (
        URLparams.id &&
        URLparams.friendID &&
        URLparams.id.match(/^[0-9a-fA-F]{24}$/) &&
        URLparams.friendID.match(/^[0-9a-fA-F]{24}$/)
      ) {
        // Check good ObjectID
        resolve({
          id: URLparams.id,
          friendID: URLparams.friendID,
        });
      } else reject(Server.fn.api.jsonError(400, 'Bad or Missing parameters'));
    });
  },

  checkRoutePlaceIDs(URLparams) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (
        URLparams.id &&
        URLparams.placeID &&
        URLparams.id.match(/^[0-9a-fA-F]{24}$/) &&
        URLparams.placeID.match(/^[0-9a-fA-F]{24}$/)
      ) {
        // Check good ObjectID
        resolve({
          id: URLparams.id,
          placeID: URLparams.placeID,
        });
      } else reject(Server.fn.api.jsonError(400, 'Bad or Missing parameters'));
    });
  },

  checkRoutePending(URLparams) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (
        URLparams.userID &&
        URLparams.placeID &&
        URLparams.userID.match(/^[0-9a-fA-F]{24}$/) &&
        URLparams.placeID.match(/^[0-9a-fA-F]{24}$/)
      ) {
        // Check good ObjectID
        resolve({
          userID: URLparams.userID,
          placeID: URLparams.placeID,
        });
      } else reject(Server.fn.api.jsonError(400, 'Bad or Missing parameters'));
    });
  },

  /* Profile */

  /* visibility : true (private) | false (public) */
  getUserProfile(id, visibility) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .getUserByID(id)
        .then(dbUser => {
          let user = {
            id: dbUser._id,
            username: dbUser.userName,
            firstname: dbUser.firstName,
            lastname: dbUser.lastName,
            image: dbUser.image,
            role: dbUser.role,
            city: dbUser.city,
            description: dbUser.description,
            friends: dbUser.friends,
            userPreference: dbUser.userPreference,
            subPlaces: dbUser.subPlaces,
          };
          if (!visibility) {
            return resolve(Server.fn.api.jsonSuccess(200, user));
          } else {
            user.gender = dbUser.gender;
            user.birthday = Server.moment(dbUser.birthDay).valueOf();
            user.email = dbUser.email;
            user.accessType = dbUser.accessType;
            return resolve(Server.fn.api.jsonSuccess(200, user));
          }
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(404, `Can't find a user associated to this id`, err)),
        );
    });
  },

  saveNewProfilePicture(user) {
    return new Promise((resolve, reject) => {
      if (user.image) {
        const dest = `${config.root}${config.media.path.root}${config.media.path.profile}`;

        try {
          Server.base64.utils.img(user.image, dest, user._id, (err, filepath) => {
            if (!err) {
              user.image =
                config.media.url + filepath.replace(`${config.root}${config.media.path.root}`, '');
              return resolve(user);
            } else reject(Server.fn.api.jsonError(400, 'Profile image error', err));
          });
        } catch (e) {
          return reject(Server.fn.api.jsonError(400, 'Profile image error', e));
        }
      } else resolve(user);
    });
  },

  editUser(user) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .editUserByID(user._id, user)
        .then(commandResult => {
          Server.fn.dbMethods.user
            .getUserByID(user._id)
            .then(dbUser => {
              return resolve(
                Server.fn.api.jsonSuccess(200, {
                  id: dbUser._id,
                  username: dbUser.userName,
                  firstname: dbUser.firstName,
                  lastname: dbUser.lastName,
                  image: dbUser.image,
                  role: dbUser.role,
                  gender: dbUser.gender,
                  birthday: Server.moment(dbUser.birthDay).valueOf(),
                  email: dbUser.email,
                  accessType: dbUser.accessType,
                  city: dbUser.city,
                  description: dbUser.description,
                }),
              );
            })
            .catch(err =>
              reject(Server.fn.api.jsonError(404, `Can't find a user associated to this id`, err)),
            );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'editUserByID()' Database error`, err)));
    });
  },

  /* Reviews */

  // Get reviews for an user
  getUserReviews(user, id, limit) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.review
        .getReviews(
          {
            authorID: id,
          },
          limit,
        )
        .then(async dbReviews => {
          let reviews = await Server.fn.routes.place.formatedReviews(dbReviews);

          if (reviews == null)
            return reject(Server.fn.api.jsonError(500, `getUserByID() Database error`));

          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: reviews,
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getReviews()' Database error`, err)));
    });
  },

  //Update user preference every time he create a review
  getUserTypePref(params) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .getUserByID(params.id)
        .then(user => {
          if (user.userPreference) {
            Server.fn.dbMethods.preference
              .getUserSelectedPreferenceByID(params.id)
              .then(userPref => resolve(userPref[0]));
          } else {
            Server.fn.dbMethods.preference
              .createPreference({
                userID: params.id,
                type: {
                  administratif: 2.5,
                  autre: 2.5,
                  bar: 3.5,
                  culture: 2.5,
                  divertissement: 2.5,
                  hotel: 2.9,
                  magasin: 2.5,
                  naturel: 2.5,
                  restaurant: 4.1,
                  transport: 2.5,
                  service: 2.5,
                },
              })
              .then(
                Server.fn.dbMethods.user.editUserByIDNew(params.id, params.id, {
                  new: true,
                }),
              )
              .then(Server.fn.dbMethods.preference.getUserSelectedPreferenceByID(params.id))
              .then(userPref => resolve(userPref))
              .catch(err =>
                reject(
                  Server.fn.api.jsonError(
                    500,
                    `'getUserSelectedPreferenceByID' function error`,
                    err,
                  ),
                ),
              );
          }
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'UpdateUserPref' function error`, err)));
    });
  },

  /***
   * uses first user pref
   * @param iaSuggestion
   * @returns {Promise<*>}
   */
  async getPlaceForUserIa(params, iaSuggestion) {
    let radius = 2000; // maybe change to ge more result
    return new Promise((resolve, reject) => {
      this.getPlaceForUser(params.id, params.longitude, params.latitude, radius, iaSuggestion.type)
        .then(place => {
          if (place.length < 1) {
            this.getPlaceForUser(
              params.id,
              params.longitude,
              params.latitude,
              radius,
              iaSuggestion.nextType,
            )
              .then(result => resolve(result))
              .catch(err =>
                reject(
                  Server.fn.api.jsonError(
                    500,
                    `'getPlaceForUserIa'  for the next type function error`,
                    err,
                  ),
                ),
              );
          } else {
            resolve(place);
          }
        })
        .catch(err =>
          reject(
            Server.fn.api.jsonError(500, `'getPlaceForUserIa' for the first function error`, err),
          ),
        );
    });
  },

  /***
   * incase that the ia didn't find a place for the user
   * the last one will be sent if that fails a defaults one is sent
   * @param params
   * @returns {Promise<*>}
   */

  async getUserLastSuggestion(params) {
    return new Promise((resolve, reject) => {
      let lastSuggestion = [];
      Server.fn.dbMethods.iasuggestion
        .getIASuggestionOrderByDesc({
          userID: params.id,
        })
        .then(userPreviousSuggestion => {
          if (userPreviousSuggestion.length > 1) {
            Server.fn.routes.place
              .getPlaceInfoAlone(userPreviousSuggestion[0].placeID, params.id)
              .then(placeInfo => {
                lastSuggestion.push({
                  id: placeInfo.data.id,
                  suggestionID: userPreviousSuggestion[0]._id,
                  name: placeInfo.data.name,
                  type: placeInfo.data.types,
                  image: placeInfo.data.image,
                  rating: placeInfo.data.rating,
                  compatibility: placeInfo.data.compatibility,
                });
                resolve(lastSuggestion);
              })
              .catch(err =>
                reject(Server.fn.api.jsonError(500, `'getPlaceInfoAlone' function error`, err)),
              );
          } else {
            lastSuggestion.push({
              id: '5bcc6f2c72c53c072c8b5501',
              suggestionID: '5c0994b4b845bf4a8d48cf7e',
              name: 'Mama Shelter Paris',
              type: 'restaurant',
              image:
                'https://lh3.googleusercontent.com/p/AF1QipOTnHjVHcfpX1uIxchhnJnhk_Ov3vqtgL_JIJ2C=s1600-w400-h400',
              rating: 4.2,
              compatibility: 80,
            });
            resolve(lastSuggestion);
          }
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'getUserLastSuggestion' function error`, err)),
        );
    });
  },

  /***
   * get ia suggestion
   * @param pref
   * @param params
   * @returns {Promise<any>}
   */
  async getIaSuggestion(pref, params) {
    return new Promise((resolve, reject) => {
      this.suggestionIA(pref)
        .then(iaSuggestion => this.getPlaceForUserIa(params, iaSuggestion))
        .then(placeSuggestion => {
          if (placeSuggestion.length < 1) {
            resolve(this.getUserLastSuggestion(params));
          } else {
            resolve(placeSuggestion);
          }
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'getIaSuggestion' function error`, err)),
        );
    });
  },

  /***
   * get highest and second highest preference
   * @param pref
   * @returns {Promise<any>}
   */
  suggestionIA(pref) {
    return new Promise((resolve, reject) => {
      let userPref = pref.type;
      let max = 0;
      let nextMax = 0;
      let type = '';
      let nextType = '';
      let suggestion = {};

      try {
        for (let key in userPref) {
          if (userPref.hasOwnProperty(key)) {
            let v = userPref[key];

            if (max < v) {
              nextMax = max;
              max = v;
              nextType = type;
              type = key;
            } else if (v < max && v > nextMax) {
              nextMax = v;
              nextType = key;
            }
          }
        }
        suggestion = {
          type: type,
          nextType: nextType,
          rating: max,
          nextRating: nextMax,
        };
      } catch (e) {
        reject(Server.fn.api.jsonError(500, `'suggestionIA' function error`));
      }
      resolve(suggestion);
    });
  },

  /*check if suggestion is new*/
  async checkNewSuggestion(userID, googlePlaceID) {
    return await Server.fn.dbMethods.iasuggestion
      .getIASuggestion({
        userID: userID,
        googlePlaceID: googlePlaceID,
      })
      .then(result => {
        if (result.length > 0) {
          return true;
        } else return false;
      });
  },

  async getPlaceForUser(user, longitude, latitude, radius, iaSuggestion) {
    let placeSuggestion = [];
    let iaValue = {};
    try {
      let placeSuggestions = await Server.fn.routes.place.getPlacesAround(
        user,
        longitude,
        latitude,
        radius,
        iaSuggestion,
      );

      let results = placeSuggestions.data.results;
      let len = results.length;
      for (let i = 0; i < len; i++) {
        if (results[i]) {
          if (await this.checkNewSuggestion(user, results[i].placeID)) {
            continue;
          } else {
            let placeInfo = await Server.fn.routes.place.getPlaceInfo(results[i].id, user);

            iaValue = {
              placeID: placeInfo.data.id,
              userID: user,
              googlePlaceID: placeInfo.data.placeID,
              type: placeInfo.data.types,
              note: 3,
            };
            let createdIASuggestion = await Server.fn.dbMethods.iasuggestion.createIASuggestion(
              iaValue,
            );
            placeSuggestion.push({
              id: placeInfo.data.id,
              suggestionID: createdIASuggestion._id,
              name: placeInfo.data.name,
              type: placeInfo.data.types,
              image: placeInfo.data.image,
              rating: placeInfo.data.rating,
              compatibility: placeInfo.data.compatibility,
            });
            break;
          }
        }
      }
      return placeSuggestion;
    } catch (e) {
      __logError(e);
      return null;
    }
  },

  getUserPreference(user, id, params, limit) {
    return new Promise((resolve, reject) => {
      this.getUserTypePref(params)
        .then(userPreference => this.getIaSuggestion(userPreference, params))
        .then(suggestion => {
          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: suggestion,
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getUserPreference' error`, err)));
    });
  },

  formattedSubPlaces(dbSubPlaces) {
    let subPlaces = [];

    try {
      for (let dbSubPlace of dbSubPlaces) {
        /*let id, image, name;*/
        if (dbSubPlace) {
          subPlaces.push({
            id: dbSubPlace._id,
            name: dbSubPlace.name,
            image: dbSubPlace.image,
          });
        }
      }
    } catch (e) {
      __logError(e);
      return null;
    }

    return subPlaces;
  },

  formattedPendingReview(dbPendingReviews) {
    let PendingReview = [];

    try {
      for (let dbPendingReview of dbPendingReviews) {
        /*let id, image, name, rating;*/
        if (dbPendingReview) {
          PendingReview.push({
            id: dbPendingReview._id,
            name: dbPendingReview.name,
            image: dbPendingReview.image,
            rating: dbPendingReview.rating,
          });
        }
      }
    } catch (e) {
      __logError(e);
      return null;
    }

    return PendingReview;
  },

  formattedFriends(dbFriends) {
    let friends = [];

    try {
      for (let dbFriend of dbFriends) {
        let fullName;
        let id;
        let image;
        if (dbFriend) {
          fullName = dbFriend.firstName + ' ' + dbFriend.lastName;
          friends.push({
            id: dbFriend._id,
            name: fullName,
            image: dbFriend.image,
          });
        }
      }
    } catch (e) {
      __logError(e);
      return null;
    }
    return friends;
  },

  /* Friend */

  getFriendsIDs(id) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .getFriendsIDList(id)
        .then(ids => resolve(ids))
        .catch(err => reject(Server.fn.api.jsonError(500, `Failed to return user friends`, err)));
    });
  },

  getFriends(ids) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .getUserInfo(ids)
        .then(idsInfo => this.formattedFriends(idsInfo))
        .then(formattedList =>
          resolve(
            Server.fn.api.jsonSuccess(200, {
              results: formattedList,
            }),
          ),
        )
        .catch(err => reject(Server.fn.api.jsonError(500, `Failed to return user friends`, err)));
    });
  },

  addFriend(id, friendID) {
    return new Promise(async (resolve, reject) => {
      Server.fn.dbMethods.user
        .editUserByID(id, {
          $addToSet: {
            friends: friendID,
          },
        })
        .then(commandResult => resolve(Server.fn.api.jsonSuccess(200, true)))
        .catch(err => reject(Server.fn.api.jsonError(500, `'editUserByID()' Database error`, err)));
    });
  },

  deleteFriend(id, friendID) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .editUserByID(id, {
          $pull: {
            friends: friendID,
          },
        })
        .then(commandResult => resolve(Server.fn.api.jsonSuccess(200, true)))
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'editUserByID()' Database delete user error`, err)),
        );
    });
  },

  /* Place sub */

  getPendingReviewsIDs(id) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .getPendingReviewList(id)
        .then(ids => resolve(Server.fn.api.jsonSuccess(200, ids)))
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `Failed to return user sub Places`, err)),
        );
    });
  },

  getPendingReviews(ids) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .getPendingReviewInfo(ids)
        .then(idsInfo => this.formattedPendingReview(idsInfo))
        .then(PendingReview =>
          resolve(
            Server.fn.api.jsonSuccess(200, {
              results: PendingReview,
            }),
          ),
        )
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `Failed to return Pending reviews`, err)),
        );
    });
  },

  getPlacesIDs(id, params) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .getSubPlacesIDList(id)
        .then(ids => resolve(params ? ((params.ids = ids), params) : ids))
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `Failed to return user sub Places`, err)),
        );
    });
  },

  getPlaces(ids) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .getSubPlacesInfo(ids)
        .then(idsInfo => this.formattedSubPlaces(idsInfo))
        .then(places =>
          resolve(
            Server.fn.api.jsonSuccess(200, {
              results: places,
            }),
          ),
        )
        .catch(err => reject(Server.fn.api.jsonError(500, `Failed to return user friends`, err)));
    });
  },

  addSubPlace(id, placeID) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.place
        .editPlaceByID(placeID, {
          $addToSet: {
            subs: id,
          },
        })
        .then(commandResult => {
          Server.fn.dbMethods.user
            .editUserByID(id, {
              $addToSet: {
                subPlaces: placeID,
              },
            })
            .then(commandResult => resolve(Server.fn.api.jsonSuccess(200, true)))
            .catch(err =>
              reject(Server.fn.api.jsonError(500, `'editUserByID()' Database error`, err)),
            );
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'editPlaceByID()' Database error`, err)),
        );
    });
  },

  deleteSubPlace(id, placeID) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.place
        .editPlaceByID(placeID, {
          $pull: {
            subs: id,
          },
        })
        .then(commandResult => {
          Server.fn.dbMethods.user
            .editUserByID(id, {
              $pull: {
                subPlaces: placeID,
              },
            })
            .then(commandResult => resolve(Server.fn.api.jsonSuccess(200, true)))
            .catch(err =>
              reject(
                Server.fn.api.jsonError(500, `'editUserByID()' Database delete places error`, err),
              ),
            );
        })
        .catch(err =>
          reject(
            Server.fn.api.jsonError(500, `'editPlaceByID()' Database delete places error`, err),
          ),
        );
    });
  },

  deletePendingReview(id, placeID) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .editUserByID(id, {
          $pull: {
            pendingReview: placeID,
          },
        })
        .then(commandResult => resolve(Server.fn.api.jsonSuccess(200, true)))
        .catch(err =>
          reject(
            Server.fn.api.jsonError(
              500,
              `'editUserByID()' Database delete pending review error`,
              err,
            ),
          ),
        );
    });
  },

  addPendingReview(id, placeID) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .editUserByID(id, {
          $addToSet: {
            pendingReview: placeID,
          },
        })
        .then(commandResult => resolve(Server.fn.api.jsonSuccess(200, true)))
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'editPlaceByID()' Database error`, err)),
        );
    });
  },
};
