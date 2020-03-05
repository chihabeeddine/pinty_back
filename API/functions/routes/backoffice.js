//=======================================================================//
//     Backoffice functions                                              //
//=======================================================================//

module.exports = {
  /* Checkers */

  checkListUsersParameters(params) {
    return new Promise((resolve, reject) => {
      let filters = {
        _id: null,
        userName: null,
        firstName: null,
        lastName: null,
        role: null,
        email: null,
      };

      if (params && Object.keys(params).length === 0) filters = null;
      else {
        if (params.id && params.id.trim() != '') {
          filters._id = params.id.split(',');
          if (!filters._id.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad IDs'));
        }

        if (params.username && params.username.trim() != '') {
          filters.userName = params.username.split(',').filter(x => x);
          filters.userName = filters.userName.map(item => new RegExp(item, 'i'));
        }

        if (params.firstname && params.firstname.trim() != '') {
          filters.firstName = params.firstname.split(',').filter(x => x);
          filters.firstName = filters.firstName.map(item => new RegExp(item, 'i'));
        }

        if (params.lastname && params.lastname.trim() != '') {
          filters.lastName = params.lastname.split(',').filter(x => x);
          filters.lastName = filters.lastName.map(item => new RegExp(item, 'i'));
        }

        if (params.role && params.role.trim() != '') {
          filters.role = params.role.split(',').filter(x => x);
        }

        if (params.email && params.email.trim() != '') {
          filters.email = params.email.split(',').filter(x => x);
          filters.email = filters.email.map(item => new RegExp(item, 'i'));
        }
      }

      resolve(filters);
    });
  },

  checkListPlacesParameters(params) {
    return new Promise((resolve, reject) => {
      let filters = {
        _id: null,
        types: null,
        rating: null,
        name: null,
      };

      if (params && Object.keys(params).length === 0) filters = null;
      else {
        if (params.id && params.id.trim() != '') {
          filters._id = params.id.split(',').filter(x => x);
          if (!filters._id.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad IDs'));
        }

        if (params.type && params.type.trim() != '') {
          filters.types = params.type.split(',').filter(x => x);
        }

        if (params.rating && params.rating.trim() != '') {
          filters.rating = params.rating.split(',').filter(x => x);
          filters.rating = filters.rating.map(item =>
            parseFloat(item)
              ? parseFloat(item)
              : reject(Server.fn.api.jsonError(400, 'Bad rating')),
          );
        }

        if (params.name && params.name.trim() != '') {
          filters.name = params.name.split(',').filter(x => x);
          filters.name = filters.name.map(item => new RegExp(item, 'i'));
        }
      }

      resolve(filters);
    });
  },

  checkListMediasParameters(params) {
    return new Promise((resolve, reject) => {
      let filters = {
        _id: null,
        authorID: null,
        reviewID: null,
        placeID: null,
        dateGTE: null,
        dateLTE: null,
      };

      if (params && Object.keys(params).length === 0) filters = null;
      else {
        if (params.id && params.id.trim() != '') {
          filters._id = params.id.split(',').filter(x => x);
          if (!filters._id.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad media IDs'));
        }

        if (params.author && params.author.trim() != '') {
          filters.authorID = params.author.split(',').filter(x => x);
          if (!filters.authorID.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad author IDs'));
        }

        if (params.review && params.review.trim() != '') {
          filters.reviewID = params.review.split(',').filter(x => x);
          if (!filters.reviewID.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad review IDs'));
        }

        if (params.place && params.place.trim() != '') {
          filters.placeID = params.place.split(',').filter(x => x);
          if (!filters.placeID.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad place IDs'));
        }

        if (params.datestart && parseInt(params.datestart))
          filters.dateGTE = Server.moment(parseInt(params.datestart)).valueOf();

        if (params.dateend && parseInt(params.dateend))
          filters.dateLTE = Server.moment(parseInt(params.dateend)).valueOf();
      }

      resolve(filters);
    });
  },

  checkListFeedbacksParameters(params) {
    return new Promise((resolve, reject) => {
      let filters = {
        _id: null,
        authorID: null,
        title: null,
        content: null,
        dateGTE: null,
        dateLTE: null,
      };

      if (params && Object.keys(params).length === 0) filters = null;
      else {
        if (params.id && params.id.trim() != '') {
          filters._id = params.id.split(',').filter(x => x);
          if (!filters._id.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad media IDs'));
        }

        if (params.author && params.author.trim() != '') {
          filters.authorID = params.author.split(',').filter(x => x);
          if (!filters.authorID.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad author IDs'));
        }

        if (params.title && params.title.trim() != '') {
          filters.title = params.title.split(',').filter(x => x);
          filters.title = filters.title.map(item => new RegExp(item, 'i'));
        }

        if (params.content && params.content.trim() != '') {
          filters.content = params.content.split(',').filter(x => x);
          filters.content = filters.content.map(item => new RegExp(item, 'i'));
        }

        if (params.datestart && parseInt(params.datestart))
          filters.dateGTE = Server.moment(parseInt(params.datestart)).valueOf();

        if (params.dateend && parseInt(params.dateend))
          filters.dateLTE = Server.moment(parseInt(params.dateend)).valueOf();
      }

      resolve(filters);
    });
  },

  checkListReviewsParameters(params) {
    return new Promise((resolve, reject) => {
      let filters = {
        _id: null,
        authorID: null,
        placeID: null,
        rating: null,
        dateGTE: null,
        dateLTE: null,
      };

      if (params && Object.keys(params).length === 0) filters = null;
      else {
        if (params.id && params.id.trim() != '') {
          filters._id = params.id.split(',').filter(x => x);
          if (!filters._id.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad media IDs'));
        }

        if (params.author && params.author.trim() != '') {
          filters.authorID = params.author.split(',').filter(x => x);
          if (!filters.authorID.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad author IDs'));
        }

        if (params.place && params.place.trim() != '') {
          filters.placeID = params.place.split(',').filter(x => x);
          if (!filters.placeID.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
            return reject(Server.fn.api.jsonError(400, 'Bad place IDs'));
        }

        if (params.rating && params.rating.trim() != '') {
          filters.rating = params.rating.split(',').filter(x => x);
          filters.rating = filters.rating.map(item =>
            parseFloat(item)
              ? parseFloat(item)
              : reject(Server.fn.api.jsonError(400, 'Bad rating')),
          );
        }

        if (params.datestart && parseInt(params.datestart))
          filters.dateGTE = Server.moment(parseInt(params.datestart)).valueOf();

        if (params.dateend && parseInt(params.dateend))
          filters.dateLTE = Server.moment(parseInt(params.dateend)).valueOf();
      }

      resolve(filters);
    });
  },

  /* Functions */

  // Get user with filters
  getUsers(filters) {
    return new Promise((resolve, reject) => {
      let query = {};

      if (filters) {
        if (filters._id)
          query._id = {
            $in: filters._id,
          };
        if (filters.userName)
          query.userName = {
            $in: filters.userName,
          };
        if (filters.firstName)
          query.firstName = {
            $in: filters.firstName,
          };
        if (filters.lastName)
          query.lastName = {
            $in: filters.lastName,
          };
        if (filters.role)
          query.role = {
            $in: filters.role,
          };
        if (filters.email)
          query.email = {
            $in: filters.email,
          };
      }

      Server.fn.dbMethods.user
        .getUsers(query)
        .then(dbUsers => {
          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: dbUsers.map(item => ({
                id: item._id,
                updatedAt: Server.moment(item.updatedAt).valueOf(),
                createdAt: Server.moment(item.createdAt).valueOf(),
                userName: item.userName,
                firstName: item.firstName,
                lastName: item.lastName,
                image: item.image,
                role: item.role,
                adminOf: item.adminOf,
                gender: item.gender,
                birthday: item.birthday,
                email: item.email,
                city: item.city,
                description: item.description,
                subPlaces: item.subPlaces,
                friends: item.friends,
                groups: item.groups,
                pendingReview: item.pendingReview,
              })),
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getUsers()' Database error`, err)));
    });
  },

  // Get places with filters
  getPlaces(filters) {
    return new Promise((resolve, reject) => {
      let query = {};

      if (filters) {
        if (filters._id)
          query._id = {
            $in: filters._id,
          };
        if (filters.name)
          query.name = {
            $in: filters.name,
          };
        if (filters.rating)
          query.rating = {
            $in: filters.rating,
          };
        if (filters.types)
          query.types = {
            $in: filters.types,
          };
      }

      Server.fn.dbMethods.place
        .getPlaces(query)
        .then(dbPlace => {
          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: dbPlace.map(item => ({
                id: item._id,
                updatedAt: Server.moment(item.updatedAt).valueOf(),
                createdAt: Server.moment(item.createdAt).valueOf(),
                placeID: item.placeID,
                name: item.name,
                formattedAddress: item.formattedAddress,
                location: item.location,
                image: item.image,
                openingHours: item.openingHours,
                phone: item.phone,
                priceLevel: item.priceLevel,
                rating: item.rating,
                googleRating: item.googleRating || 2.5,
                types: item.types,
                website: item.website,
                lastRequest: item.lastRequest,
                subs: item.subs,
              })),
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getPlaces()' Database error`, err)));
    });
  },

  // Get medias with filters
  getMedias(filters) {
    return new Promise((resolve, reject) => {
      let query = {};

      if (filters) {
        if (filters._id)
          query._id = {
            $in: filters._id,
          };
        if (filters.authorID)
          query.authorID = {
            $in: filters.authorID,
          };
        if (filters.reviewID)
          query.reviewID = {
            $in: filters.reviewID,
          };
        if (filters.placeID)
          query.placeID = {
            $in: filters.placeID,
          };

        if (filters.dateGTE || filters.dateLTE) {
          query.createdAt = {};
          if (filters.dateGTE) query.createdAt['$gte'] = new Date(filters.dateGTE);
          if (filters.dateLTE) query.createdAt['$lte'] = new Date(filters.dateLTE);
        }
      }

      Server.fn.dbMethods.media
        .getMedias(query)
        .then(dbMedia => {
          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: dbMedia.map(item => ({
                id: item._id,
                updatedAt: Server.moment(item.updatedAt).valueOf(),
                createdAt: Server.moment(item.createdAt).valueOf(),
                authorID: item.authorID,
                filePath: item.filePath,
                authorID: item.authorID,
                reviewID: item.reviewID,
                placeID: item.placeID,
                type: item.type,
                height: item.height,
                width: item.width,
                size: item.size,
              })),
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getMedia()' Database error`, err)));
    });
  },

  // Get feedbacks with filters
  getFeedbacks(filters) {
    return new Promise((resolve, reject) => {
      let query = {};

      if (filters) {
        if (filters._id)
          query._id = {
            $in: filters._id,
          };
        if (filters.authorID)
          query.authorID = {
            $in: filters.authorID,
          };
        if (filters.title)
          query.title = {
            $in: filters.title,
          };
        if (filters.content)
          query.content = {
            $in: filters.content,
          };
        if (filters.dateGTE || filters.dateLTE) {
          query.createdAt = {};
          if (filters.dateGTE) query.createdAt['$gte'] = new Date(filters.dateGTE);
          if (filters.dateLTE) query.createdAt['$lte'] = new Date(filters.dateLTE);
        }
      }

      Server.fn.dbMethods.feedback
        .getFeedbacks(query)
        .then(dbFeedbacks => {
          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: dbFeedbacks.map(item => ({
                id: item._id,
                updatedAt: Server.moment(item.updatedAt).valueOf(),
                createdAt: Server.moment(item.createdAt).valueOf(),
                authorID: item.authorID,
                title: item.title,
                content: item.content,
                medias: item.medias,
              })),
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getFeedbacks()' Database error`, err)));
    });
  },

  // Get reviews with filters
  getReviews(filters) {
    return new Promise((resolve, reject) => {
      let query = {};

      if (filters) {
        if (filters._id)
          query._id = {
            $in: filters._id,
          };
        if (filters.authorID)
          query.authorID = {
            $in: filters.authorID,
          };
        if (filters.placeID)
          query.placeID = {
            $in: filters.placeID,
          };
        if (filters.rating)
          query.rating = {
            $in: filters.rating,
          };
        if (filters.dateGTE || filters.dateLTE) {
          query.createdAt = {};
          if (filters.dateGTE) query.createdAt['$gte'] = new Date(filters.dateGTE);
          if (filters.dateLTE) query.createdAt['$lte'] = new Date(filters.dateLTE);
        }
      }

      Server.fn.dbMethods.review
        .getReviews(query)
        .then(dbReviews => {
          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: dbReviews.map(item => ({
                id: item._id,
                updatedAt: Server.moment(item.updatedAt).valueOf(),
                createdAt: Server.moment(item.createdAt).valueOf(),
                authorID: item.authorID,
                placeID: item.placeID,
                rating: item.rating,
                message: item.message,
              })),
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getReviews()' Database error`, err)));
    });
  },
};
