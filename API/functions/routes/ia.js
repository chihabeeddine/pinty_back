//=======================================================================//
//     News functions                                                    //
//=======================================================================//

module.exports = {
  /* Checkers */

  checkNoteSuggestionParameters(URLparams, params) {
    return new Promise((resolve, reject) => {
      let suggestion = {
        id: null,
        userID: null,
        note: null,
      };

      // Check mandatory params
      if (URLparams.id && URLparams.id.match(/^[0-9a-fA-F]{24}$/)) suggestion.id = URLparams.id;
      // Check good ObjectID
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing id'));

      if (params.userID && params.userID.match(/^[0-9a-fA-F]{24}$/))
        suggestion.userID = params.userID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing user ID'));

      if (params.note && parseInt(params.note, 10) >= 0 && parseInt(params.note, 10) <= 2)
        suggestion.note = parseInt(params.note, 10);
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing note'));

      resolve(suggestion);
    });
  },

  checkRouteAroundParametersID(id, body) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (parseFloat(body.longitude) != NaN && parseFloat(body.latitude) != NaN) {
        let params = {
          id: id,
          longitude: parseFloat(body.longitude) || 0,
          latitude: parseFloat(body.latitude) || 0,
        };
        return resolve(params);
      } else return reject(Server.fn.api.jsonError(400, 'Missing parameters'));
    });
  },

  checkRouteFormParametersID(id, body) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (parseFloat(body.longitude) != NaN && parseFloat(body.latitude) != NaN) {
        let params = {
          id: id,
          longitude: parseFloat(body.longitude) || 0,
          latitude: parseFloat(body.latitude) || 0,
          pref: body.pref || {},
        };
        return resolve(params);
      } else return reject(Server.fn.api.jsonError(400, 'Missing parameters'));
    });
  },

  /* Functions */

  editSuggestion(suggestion) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.iasuggestion
        .editIASuggestionByID(suggestion.id, _.omit(suggestion, ['id', 'userID']))
        .then(ob => this.updateUserPrefFromSuggestion(suggestion))
        .then(commandResult => resolve(Server.fn.api.jsonSuccess(200, true)))
        .catch(err => reject(Server.fn.api.jsonError(404, `Can't update the suggestion`, err)));
    });
  },


  async updateUserPrefFromSuggestion(suggestion) {
    try {
      let ratio = 1.2; //coeff for how influential is the suggestion on the user pref

      let userSuggestion = await Server.fn.dbMethods.iasuggestion.getIASuggestionByID(
        suggestion.id,
      );
      let userPreference = await Server.fn.dbMethods.preference.getUserPreferenceByID(
        suggestion.userID,
      );
      let newUserPreference = userPreference.type;

      let note = userSuggestion.note * ratio;
      let placeType = userSuggestion.type;

      for (let key in newUserPreference) {
        if (newUserPreference.hasOwnProperty(key)) {
          if (placeType == key) newUserPreference[key] = (newUserPreference[key] + note) / 2;
        }
      }
      await Server.fn.dbMethods.preference.editPreferenceByID(suggestion.userID, {
        type: newUserPreference,
      });
    } catch (e) {
      __logError(e);
      return null;
    }
  },

  /**
   * update user preference after that he filled the survey for demo, i delete previous suggestion so that the ia have the best sugg 
   *
   * @param {*} id
   * @param {*} pref
   */
  updateUserPrefFromSurvey(params) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.preference.editPreferenceByID(params.id, {
          type: params.pref,
        })
        .then(pref => Server.fn.dbMethods.iasuggestion.deleteIASuggestions({
          userID: params.id
        }))
        .then(res => resolve(Server.fn.api.jsonSuccess(200, true)))
        .catch(err => reject(Server.fn.api.jsonError(500, `Can't update the pref`, err)));

    });
  },


  getCorrectRatio(rating) {
    let max = 5;
    let value = 0;
    let percentage = 100;
    try {
      value = (rating * percentage) / max;
    } catch (e) {
      __logError(e);
      return null;
    }
    return Math.round(value);
  },

  /***
   *  get user compatibility with a type
   * @param user
   * @param type
   * @returns {Promise<*>}
   */
  async getCompatibilityIA(user, type) {
    let param = {};

    try {
      if (typeof user === 'string') {
        param = {
          id: user,
        };
        let userPreference = await Server.fn.routes.user.getUserTypePref(param);
        let rating = userPreference.type[type];
        return this.getCorrectRatio(rating);
      } else if (typeof user === 'object') {
        param = {
          id: user._id,
        };
        let userPreference = await Server.fn.routes.user.getUserTypePref(param);
        let rating = userPreference.type[type];
        return this.getCorrectRatio(rating);
      }
    } catch (e) {
      __logError(e);
      return null;
    }
  },

  /***
   * sort the pref by type
   * @param pref
   * @returns {Array}
   */
  sortProperties(pref) {
    // convert object into array
    let sortable = [];
    for (let key in pref)
      if (pref.hasOwnProperty(key)) sortable.push([key, pref[key]]); // each item is an array in format [key, value]

    // sort items by value
    sortable.sort(function (a, b) {
      return a[1] - b[1]; // compare numbers
    });
    return sortable;
  },
};