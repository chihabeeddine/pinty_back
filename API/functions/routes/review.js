//=======================================================================//
//     Review functions                                                 //
//=======================================================================//

let place = require('./place');

module.exports = {
  /* Checkers */

  checkRouteReviewID(URLparams) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (URLparams.id && URLparams.id.match(/^[0-9a-fA-F]{24}$/)) resolve(URLparams.id);
      // Check good ObjectID
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing id'));
    });
  },

  checkRouteReview(params) {
    return new Promise((resolve, reject) => {
      let review = {
        authorID: null,
        placeID: null,
        rating: null,
        message: null,
        medias: [],
      };

      // Check mandatory params
      if (params.authorID && params.authorID.match(/^[0-9a-fA-F]{24}$/))
        review.authorID = params.authorID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing author ID'));

      if (params.placeID && params.placeID.match(/^[0-9a-fA-F]{24}$/))
        review.placeID = params.placeID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing place ID'));

      if (params.rating && parseFloat(params.rating) >= 0 && parseFloat(params.rating) <= 5)
        review.rating = parseFloat(params.rating);
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing rating'));

      if (params.message && params.message.trim() != '') review.message = params.message.trim();

      if (params.medias && Array.isArray(params.medias)) {
        for (const media of params.medias) {
          try {
            const mime = media.match(/^data:((image|video)\/\w+);base64,[\s\S]+/);
            let noHeader = media.split('base64,')[1];

            if (!noHeader)
              return reject(Server.fn.api.jsonError(400, 'Bad image (no header data/mime)'));

            const fileSize = (noHeader.replace(/=/g, '').length * 0.75) / 1000;

            if (
              Server.base64.isBase64(noHeader) &&
              mime &&
              fileSize <= config.media.maxSizeImageOrVideo
            ) {
              review.medias.push({
                base64: noHeader,
                type: mime[1],
                height: null,
                width: null,
                size: fileSize,
              });
            } else return reject(Server.fn.api.jsonError(400, 'Bad media or bad size'));
          } catch (error) {
            return reject(Server.fn.api.jsonError(400, 'Bad image or bad size', error));
          }
        }
      }

      resolve(review);
    });
  },

  checkRouteReviewParam(URLparams, params) {
    return new Promise((resolve, reject) => {
      let review = {};

      if (URLparams.id && URLparams.id.match(/^[0-9a-fA-F]{24}$/)) review._id = URLparams.id;
      // Check good ObjectID
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing id'));

      // Check mandatory params
      if (params.authorID && params.authorID.match(/^[0-9a-fA-F]{24}$/))
        review.authorID = params.authorID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing author ID'));

      if (params.rating && parseFloat(params.rating) >= 0 && parseFloat(params.rating) <= 5)
        review.rating = parseFloat(params.rating);
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing rating'));

      if (params.message && params.message.trim() != '') review.message = params.message.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing message'));

      resolve(review);
    });
  },

  async updateUserFromReview(userID, type, note) {
    try {
      let ratio = 1.1; // Coef
      let userPreference = await Server.fn.dbMethods.preference.getUserPreferenceByID(userID);
      let newUserPreference = userPreference.type;

      for (let key in newUserPreference) {
        if (newUserPreference.hasOwnProperty(key)) {
          if (type == key) newUserPreference[key] = (newUserPreference[key] + note * ratio) / 2;
        }
      }
      await Server.fn.dbMethods.preference.editPreferenceByID(userID, {
        type: newUserPreference,
      });
    } catch (e) {
      __logError(e);
      return null;
    }
  },

  /* Functions */

  createReview(review) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.review
        .createReview(review)
        .then(createdReview => {
          Server.fn.dbMethods.place
            .getPlaceByID(createdReview.placeID.toString())
            .then(placeInfo => {
              let place;
              if (!placeInfo) place = null;
              else {
                place = {
                  id: placeInfo._id,
                  name: placeInfo.name,
                  image: placeInfo.image,
                };
              }
              let gtype = Server.fn.routes.place.googleTypesToPintys(placeInfo.types.split(','));
              this.updateUserFromReview(createdReview.authorID, gtype, createdReview.rating);
              return resolve({
                id: createdReview._id,
                type: 'pinty',
                authorID: createdReview.authorID,
                rating: createdReview.rating,
                message: createdReview.message,
                place: place,
                created: Server.moment(createdReview.createdAt).valueOf(),
                medias: review.medias,
              });
            });
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'createReview()' Database error`, err)));
    });
  },

  addMedia(review) {
    return new Promise(async (resolve, reject) => {
      for (const i in review.medias) {
        const media = review.medias[i];
        let dest, filePath;
        try {
          dest = Server.makeDir.sync(
            `${config.root}${config.media.path.root}${config.media.path.review}/${review.id}`,
          ); // Create dir if doesn't exist
          filePath = `${dest}/${Server.hat(32)}.${Server.mime.extension(media.type)}`;

          Server.fs.writeFileSync(filePath, media.base64, {
            encoding: 'base64',
          }); // Save file
          delete media.base64; // Delete base64 media from object
        } catch (e) {
          return reject(Server.fn.api.jsonError(400, 'Add media error', e));
        }

        try {
          var dimensions = Server.sizeOfImage(filePath);
          media.width = dimensions.width;
          media.height = dimensions.height;
        } catch (e) {
          media.width = null;
          media.height = null;
        }

        try {
          let createdMedia = await Server.fn.dbMethods.media.createMedia({
            filePath: filePath.replace(`${config.root}${config.media.path.root}`, ''),
            authorID: review.authorID,
            reviewID: review.id,
            placeID: review.place ? review.place.id : null,
            type: media.type,
            height: media.height,
            width: media.width,
            size: media.size,
          });
          review.medias[i] = {
            id: createdMedia._id,
            url: config.media.url + createdMedia.filePath,
            metadata: {
              type: createdMedia.type,
              height: createdMedia.height,
              width: createdMedia.width,
              size: createdMedia.size,
            },
          };
        } catch (error) {
          return reject(Server.fn.api.jsonError(500, `Can't create media`, error));
        }
      }
      return resolve(Server.fn.api.jsonSuccess(200, review));
    });
  },

  getPendingReview(id) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.review
        .getReviewByID(id)
        .then(dbReview => {
          let review = {
            id: dbReview._id,
            authorID: dbReview.authorID,
          };
          return resolve(review);
        })
        .catch(err =>
          reject(
            Server.fn.api.jsonError(404, `Can't find a pending review associated to this id`, err),
          ),
        );
    });
  },

  getReview(id) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.review
        .getReviewByID(id)
        .then(dbReview => {
          let review = {
            id: dbReview._id,
            authorID: dbReview.authorID,
          };
          return resolve(review);
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(404, `Can't find a review associated to this id`, err)),
        );
    });
  },

  deleteReview(id) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.review
        .deleteReviewByID(id)
        .then(results => resolve(Server.fn.api.jsonSuccess(200, true)))
        .catch(err =>
          reject(
            Server.fn.api.jsonError(404, `Can't delete the review associated to this id`, err),
          ),
        );
    });
  },

  deleteMedia(review) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.media
        .deleteMedias({
          reviewID: review.id,
        })
        .then(() => {
          Server.fs.removeSync(
            `${config.root}${config.media.path.root}${config.media.path.review}/${review.id}`,
          );
          resolve(review);
        })
        .catch(err =>
          reject(
            Server.fn.api.jsonError(500, `Can't find medias associated to this review id`, err),
          ),
        );
    });
  },

  editReview(review) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.review
        .editReviewByID(review._id, review)
        .then(commandResult => {
          Server.fn.dbMethods.review
            .getReviewByID(review._id)
            .then(dbReview => {
              Server.fn.dbMethods.place
                .getPlaceByID(dbReview.placeID.toString())
                .then(placeInfo => {
                  let place = placeInfo
                    ? {
                        id: placeInfo._id,
                        name: placeInfo.name,
                        image: placeInfo.image,
                      }
                    : null;

                  return resolve(
                    Server.fn.api.jsonSuccess(200, {
                      id: dbReview._id,
                      type: 'pinty',
                      authorID: dbReview.authorID,
                      rating: dbReview.rating,
                      message: dbReview.message,
                      place: place,
                      created: Server.moment(dbReview.createdAt).valueOf(),
                    }),
                  );
                });
            })
            .catch(err =>
              reject(
                Server.fn.api.jsonError(404, `Can't find a review associated to this id`, err),
              ),
            );
        })
        .catch(err => reject(Server.fn.api.jsonError(404, `Can't update the review`, err)));
    });
  },
};
