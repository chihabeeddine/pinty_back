//=======================================================================//
//     Place functions                                                   //
//=======================================================================//

module.exports = {
  typeObj: {
    restaurant: ['restaurant', 'meal_delivery', ' meal_takeaway', 'bakery', 'cafe'],
    naturel: ['park', 'campground', 'rv_park'],
    bar: ['bar', 'night_club'],
    hotel: ['hotel', 'lodging', 'establishment'],
    divertissement: [
      'zoo',
      'amusement_park',
      'bowling_alley',
      'aquarium',
      'gym',
      'spa',
      'stadium',
      'casino',
    ],
    culture: [
      'art_gallery',
      'mosque',
      'church',
      'hindu_temple',
      'museum',
      'movie_theater',
      'library',
      'synagogue',
      'cemetery',
    ],
    transport: [
      'airport',
      'bus_stationt',
      'taxi_stand',
      'train_stationt',
      'transit_stationt',
      'travel_agency',
      'subway_station',
      'parking',
    ],
    magasin: [
      'car_dealer',
      'car_rental',
      'car_repair',
      'car_wash',
      'movie_rental',
      'beauty_salon',
      'bicycle_store',
      'book_store',
      'shoe_store',
      'shopping_mall',
      'pet_store',
      'pharmacy',
      'storage',
      'clothing_store',
      'store',
      'supermarket',
      'convenience_store',
      'department_store',
      'electronics_store',
      'hair_care',
      'liquor_store',
      'hardware_store',
      'insurance_agency',
      'jewelry_store',
      'laundry',
      ' home_goods_store',
      'furniture_store',
      'florist',
    ],
    administratif: [
      'accounting',
      'atm',
      'police',
      'post_office',
      'real_estate',
      'agency',
      'bank',
      'city_hall',
      'embassy',
      'lawyer',
      'local_government',
      'office',
      'hospital',
      'school',
      'veterinary_care',
      'courthouse',
      'fire_station',
    ],
    service: [
      'doctor',
      'dentist',
      'locksmith',
      'funeral_home',
      'gas_station',
      'painter',
      'roofing_contractor',
      'moving_company',
      'physiotherapist',
      'plumber',
    ],
  },

  googleTypesToPintys(types) {
    if (types) {
      for (var j = 0; j < types.length; j++) {
        for (var index in this.typeObj) {
          if (this.typeObj[index].includes(types[j])) return index;
        }
      }
    }
    return 'autre';
  },

  checkRouteAroundParameters(body) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (
        parseFloat(body.longitude) != NaN &&
        parseFloat(body.latitude) != NaN &&
        parseInt(body.radius) != NaN
      ) {
        let params = {
          longitude: parseFloat(body.longitude) || 0,
          latitude: parseFloat(body.latitude) || 0,
          radius: (parseInt(body.radius) || 500) > 50000 ? 50000 : parseInt(body.radius), // max: 50 000
          type: body.type ? body.type.toLowerCase() : 'point_of_interest', // default: point_of_interest
        };
        return resolve(params);
      } else return reject(Server.fn.api.jsonError(400, 'Missing parameters'));
    });
  },

  checkPlaceItemsParameters(URLparams) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (URLparams.id && URLparams.id.match(/^[0-9a-fA-F]{24}$/)) {
        // Check good ObjectID
        let params = {
          id: URLparams.id,
          limit: parseInt(URLparams.limit) || null,
        };

        return resolve(params);
      } else return reject(Server.fn.api.jsonError(400, 'Bad or Missing parameters'));
    });
  },

  async formatedReviews(dbReviews) {
    let reviews = [];

    try {
      for (let dbReview of dbReviews) {
        let user = await Server.fn.dbMethods.user.getUserByID(dbReview.authorID);
        let placeInfo = await Server.fn.dbMethods.place.getPlaceByID(dbReview.placeID.toString());
        let dbMedias = await Server.fn.dbMethods.media.getMedias({
          reviewID: dbReview._id,
        });
        let medias = await this.formatedMedias(dbMedias);

        let author = user
          ? {
              id: user._id.toString(),
              name: user.userName ? user.userName : `${user.firstName} ${user.lastName}`,
              pp: user.image,
            }
          : null;
        let place = placeInfo
          ? {
              id: placeInfo._id,
              name: placeInfo.name,
              image: placeInfo.image,
            }
          : null;

        reviews.push({
          id: dbReview._id,
          type: dbReview.type,
          author: author,
          rating: dbReview.rating,
          message: dbReview.message,
          medias: medias || [],
          place: place,
          created: Server.moment(dbReview.createdAt).valueOf(),
        });
      }
    } catch (e) {
      __logError(e);
      return null;
    }

    return reviews;
  },

  async formatedPreferences(dbReviews) {
    let reviews = [];

    try {
      for (let dbReview of dbReviews) {
        let placeInfo = await Server.fn.dbMethods.place.getPlaceByID(dbReview.placeID.toString());

        let place = placeInfo
          ? {
              id: placeInfo._id,
              name: placeInfo.name,
              priceLevel: placeInfo.priceLevel,
              /*googleRating: placeInfo.googleRating,*/
              types: placeInfo.types,
              rating: placeInfo.rating,
              location: placeInfo.location,
            }
          : null;

        reviews.push({
          rating: dbReview.rating,
          id: placeInfo._id,
          priceLevel: placeInfo.priceLevel,
          types: placeInfo.types,
          /*rating: placeInfo.rating,*/
          /*place: place*/
          /*created: Server.moment(dbReview.createdAt).valueOf()*/
        });
      }
    } catch (e) {
      __logError(e);
      return null;
    }

    return reviews;
  },

  async formatedGoogleReviews(id) {
    return new Promise(resolve => {
      let reviews = [];

      Server.fn.dbMethods.place
        .getPlaceByID(id)
        .then(dbPlace => {
          Server.google.maps.place(
            {
              placeid: dbPlace.placeID,
            },
            function(err, response) {
              if (!err) {
                if (response.json.result.reviews && response.json.result.reviews.length > 0) {
                  for (let review of response.json.result.reviews) {
                    reviews.push({
                      id: null,
                      type: 'google',
                      author: {
                        id: null,
                        name: review.author_name,
                        pp: review.profile_photo_url,
                      },
                      rating: review.rating,
                      message: review.text,
                      created: review.time * 1000,
                    });
                  }
                }
                return resolve(reviews);
              } else resolve(null);
            },
          );
        })
        .catch(err => resolve(null));
    });
  },

  async formatedMedias(dbMedias) {
    let medias = [];

    try {
      for (let dbMedia of dbMedias) {
        let author;
        let user = await Server.fn.dbMethods.user.getUserByID(dbMedia.authorID);
        if (!user) author = null;
        else {
          author = {
            id: user._id,
            name: user.userName ? user.userName : `${user.firstName} ${user.lastName}`,
            pp: user.image,
          };
        }

        medias.push({
          id: dbMedia._id,
          reviewID: dbMedia.reviewID,
          author: author,
          url: `${config.media.url}${dbMedia.filePath}`,
          metadata: {
            type: dbMedia.type, // check npm module mime
            height: dbMedia.height,
            width: dbMedia.width,
            size: dbMedia.size,
          },
        });
      }
    } catch (e) {
      __logError(e);
      return null;
    }

    return medias;
  },

  //Get avg from db and google
  //if there is no reviews it send back google rating
  async getAvg(id, gRating) {
    let dbReviews = await Server.fn.dbMethods.review.getReviews({
      placeID: id,
    });
    let avg = 0;

    dbReviews = dbReviews.map(dbReview => dbReview.rating);

    if (dbReviews.length > 0) {
      let sum = dbReviews.reduce((previous, current) => (current += previous));
      avg = sum / dbReviews.length;
      avg = (avg + gRating) / 2; //TODO: algo+
    } else {
      avg = gRating || 2.65;
    }

    return parseFloat(avg.toFixed(1));
  },

  // Get reviews for a place
  getPlaceReviews(user, id, limit) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.review
        .getReviews(
          {
            placeID: id,
          },
          limit,
        )
        .then(async dbReviews => {
          let reviews = await this.formatedReviews(dbReviews);
          //let googleReviews = await this.formatedGoogleReviews(id);

          if (reviews == null)
            return reject(Server.fn.api.jsonError(500, `getUserByID() Database error`));
          //if (googleReviews == null) googleReviews = []; //return reject(Server.fn.api.jsonError(500, `Can't find a place associated to this id google`));

          let userReviews = [];

          // Remove and get owned reviews
          reviews = reviews.filter(e =>
            e.author && e.author.id == user._id ? (userReviews.push(e), false) : true,
          );

          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: userReviews.concat(reviews), // userReviews.concat(reviews.concat(googleReviews))
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getReviews()' Database error`, err)));
    });
  },

  // Get medias for a place
  getPlaceMedias(user, id, limit) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.media
        .getMedias(
          {
            placeID: id,
          },
          limit,
        )
        .then(async dbMedias => {
          let medias = await this.formatedMedias(dbMedias);

          if (medias == null)
            return reject(Server.fn.api.jsonError(500, `getUserByID() Database error`));

          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: medias,
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getMedias()' Database error`, err)));
    });
  },

  getPlaceImageByGoogle(photos) {
    return new Promise(resolve => {
      if (photos && photos.length > 0) {
        photoRef = photos[0].photo_reference;

        Server.google.maps.placesPhoto(
          {
            photoreference: photoRef,
            maxwidth: 400,
            maxheight: 400,
          },
          (err, response) => {
            if (!err) return resolve('https://' + response.req.socket._host + response.req.path);
            else {
              __logError("Can't get a google place image");
              return resolve(null);
            }
          },
        );
      } else return resolve(null);
    });
  },

  getPlaceImageByPinty(placeID) {
    return new Promise(resolve => {
      Server.fn.dbMethods.media
        .getMedias({
          placeID: placeID,
        })
        .then(medias => {
          if (medias && medias.length > 0)
            return resolve(`${config.media.url}/${medias[0].filePath}`);
          else resolve(null);
        })
        .catch(() => {
          __logError("Can't get a pinty place image");
          return resolve(null);
        });
    });
  },

  getFriendsPassedByPlace(user, placeID) {
    return new Promise(resolve => {
      Server.fn.dbMethods.review
        .getFriendsReviewsByPlace(user.friends, placeID)
        .then(async friends => {
          try {
            let friendsList = [];

            for (let friend of friends) {
              let user = await Server.fn.dbMethods.user.getUserByID(friend);

              if (user) {
                friendsList.push({
                  id: user._id.toString(),
                  name: user.userName ? user.userName : `${user.firstName} ${user.lastName}`,
                  pp: user.image,
                });
              }
            }

            resolve(friendsList);
          } catch (err) {
            __logError("Can't get friend passed by place (catch)");
            __logError(err);
            resolve([]);
          }
        })
        .catch(err => {
          __logError("Can't get friend passed by place");
          __logError(err);
          resolve([]);
        });
    });
  },

  //Get places info
  getPlaceInfo(placeID, user) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.place
        .getPlaceByID(placeID)
        .then(async dbPlace => {
          if (dbPlace && Date.now() - dbPlace.lastRequest >= 86400000) {
            Server.google.maps.place(
              {
                placeid: dbPlace.placeID,
              },
              async (err, response) => {
                if (!err) {
                  let gPlace = response.json.result;
                  dbPlace.name = gPlace.name;
                  dbPlace.formattedAddress = gPlace.formatted_address;
                  dbPlace.location = [gPlace.geometry.location.lng, gPlace.geometry.location.lat];
                  dbPlace.openingHours = gPlace.opening_hours
                    ? gPlace.opening_hours.weekday_text
                    : [];
                  /*is an array of seven strings representing the formatted opening hours for each day of the week.*/
                  dbPlace.phone = gPlace.international_phone_number;
                  dbPlace.priceLevel = gPlace.price_level;
                  dbPlace.googleRating = gPlace.rating;
                  dbPlace.types = this.googleTypesToPintys(gPlace.types);
                  dbPlace.url = gPlace.url;
                  dbPlace.website = gPlace.website || null;
                  dbPlace.lastRequest = Server.moment().valueOf();

                  if (!dbPlace.image)
                    dbPlace.image = await this.getPlaceImageByGoogle(gPlace.photos);
                  await Server.fn.dbMethods.place.editPlaceByID(placeID, dbPlace);
                  return resolve(
                    Server.fn.api.jsonSuccess(200, {
                      id: dbPlace._id,
                      placeID: dbPlace.placeID,
                      name: dbPlace.name,
                      formattedAddress: dbPlace.formattedAddress,
                      location: dbPlace.location,
                      phone: dbPlace.phone,
                      priceLevel: dbPlace.priceLevel,
                      rating: (await this.getAvg(dbPlace._id, gPlace.rating)) || 0,
                      googleRating: dbPlace.googleRating || 2.5,
                      url: dbPlace.url,
                      website: dbPlace.website,
                      lastRequest: Server.moment(dbPlace.lastRequest).valueOf(),
                      types: dbPlace.types,
                      openingHours: dbPlace.openingHours,
                      image: dbPlace.image,
                      friends: await this.getFriendsPassedByPlace(user, dbPlace._id),
                      compatibility: await Server.fn.routes.ia.getCompatibilityIA(
                        user,
                        dbPlace.types,
                      ), // TODO: generate % de compatibilité
                      subs: dbPlace.subs,
                    }),
                  );
                } else
                  return reject(
                    Server.fn.api.jsonError(500, `Can't find a place associated to this id google`),
                  );
              },
            );
          } else {
            return resolve(
              Server.fn.api.jsonSuccess(200, {
                id: dbPlace._id,
                placeID: dbPlace.placeID,
                name: dbPlace.name,
                formattedAddress: dbPlace.formattedAddress,
                location: dbPlace.location,
                phone: dbPlace.phone,
                priceLevel: dbPlace.priceLevel,
                rating: (await this.getAvg(dbPlace._id, dbPlace.googleRating)) || 0,
                googleRating: dbPlace.googleRating || 2.5,
                url: dbPlace.url,
                website: dbPlace.website,
                lastRequest: Server.moment(dbPlace.lastRequest).valueOf(),
                types: dbPlace.types,
                openingHours: dbPlace.openingHours,
                image: dbPlace.image,
                friends: await this.getFriendsPassedByPlace(user, dbPlace._id),
                compatibility: await Server.fn.routes.ia.getCompatibilityIA(user, dbPlace.types), // TODO: generate % de compatibilité
                subs: dbPlace.subs,
              }),
            );
          }
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(404, `Can't find a place associated to this id`, err)),
        );
    });
  },

  /***
   * tmp function without friends
   * @param user
   * @param longitude
   * @param latitude
   * @param radius
   * @param type
   * @returns {*}
   */

  getPlaceInfoAlone(placeID, user) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.place
        .getPlaceByID(placeID)
        .then(async dbPlace => {
          return resolve(
            Server.fn.api.jsonSuccess(200, {
              id: dbPlace._id,
              placeID: dbPlace.placeID,
              name: dbPlace.name,
              formattedAddress: dbPlace.formattedAddress,
              phone: dbPlace.phone,
              priceLevel: dbPlace.priceLevel,
              rating: (await this.getAvg(dbPlace._id, dbPlace.googleRating)) || 0,
              url: dbPlace.url,
              website: dbPlace.website,
              types: dbPlace.types,
              openingHours: dbPlace.openingHours,
              image: dbPlace.image,
              compatibility: await Server.fn.routes.ia.getCompatibilityIA(user, dbPlace.types),
            }),
          );
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'getPlaceInfoAlone' function error`, err)),
        );
    });
  },

  // Get places around a location with parameters
  getPlacesAround(user, longitude, latitude, radius, type) {
    let requestParams = {
      location: [latitude, longitude],
      radius,
      type,
    };
    return this.getPlacesNearby(user, requestParams);
  },

  // Get more places using location and page token (from before)
  getPlacesAroundToken(user, longitude, latitude, pageToken) {
    let requestParams = {
      location: [latitude, longitude],
      pagetoken: pageToken,
    };

    return this.getPlacesNearby(user, requestParams);
  },

  async formatedPlaces(user, gPlaces) {
    let places = [];

    for (let gPlace of gPlaces) {
      try {
        let dbPlace = await Server.fn.dbMethods.place.placeExistByPlaceID(gPlace.place_id);

        if (dbPlace) {
          dbPlace.name = gPlace.name;
          dbPlace.location = [gPlace.geometry.location.lng, gPlace.geometry.location.lat];
          dbPlace.rating = (await this.getAvg(dbPlace._id, gPlace.rating)) || 0;
          dbPlace.googleRating = gPlace.rating;
          dbPlace.types = this.googleTypesToPintys(gPlace.types);
          if (!dbPlace.image) dbPlace.image = await this.getPlaceImageByPinty(dbPlace._id);
          await Server.fn.dbMethods.place.editPlaceByID(dbPlace._id, dbPlace);
        } else {
          dbPlace = await Server.fn.dbMethods.place.createPlace({
            placeID: gPlace.place_id,
            name: gPlace.name,
            formattedAddress: null,
            location: [gPlace.geometry.location.lng, gPlace.geometry.location.lat],
            openingHours: null,
            image: null,
            phone: null,
            priceLevel: null,
            rating: 0,
            googleRating: gPlace.rating || 2.5,
            types: this.googleTypesToPintys(gPlace.types),
            url: null,
            website: null,
            lastRequest: null,
          });
        }

        const place = {
          id: dbPlace._id,
          placeID: dbPlace.placeID,
          latitude: dbPlace.location[1],
          longitude: dbPlace.location[0],
          name: dbPlace.name,
          rating: dbPlace.rating,
          googleRating: dbPlace.googleRating || 2.5, // Rating de google
          types: dbPlace.types,
          subs: dbPlace.subs,
          image: dbPlace.image || null,
        };

        place.friends = await this.getFriendsPassedByPlace(user, dbPlace._id);
        place.compatibility = 0; // TODO: generate % de compatibilité

        places.push(place);
      } catch (e) {
        __logError(e);
        return null;
      }
    }

    return places;
  },

  getPlacesNearby(user, requestParams) {
    return new Promise((resolve, reject) => {
      Server.google.maps
        .placesNearby(requestParams)
        .asPromise()
        .then(async response => {
          switch (response.json.status) {
            case 'OK':
              let responseData = {
                results: await this.formatedPlaces(user, response.json.results),
              };

              if (response.json.next_page_token)
                responseData.nextPageToken = response.json.next_page_token;

              if (responseData.results == null)
                return reject(Server.fn.api.jsonError(500, `Create/Update place Database error`));
              return resolve(Server.fn.api.jsonSuccess(200, responseData));

            case 'ZERO_RESULTS':
              return resolve(
                Server.fn.api.jsonSuccess(200, {
                  results: [],
                }),
              );

            case 'OVER_QUERY_LIMIT':
              return reject(Server.fn.api.jsonError(429, `(Google) OVER_QUERY_LIMIT`));

            case 'REQUEST_DENIED':
              return reject(
                Server.fn.api.jsonError(500, `(Google) REQUEST_DENIED`, 'REQUEST_DENIED'),
              );

            case 'INVALID_REQUEST':
              return reject(
                Server.fn.api.jsonError(400, '(Google) Missing parameters (maybe pagetoken)'),
              );

            default:
              return reject(
                Server.fn.api.jsonError(
                  500,
                  `Internal Server Error`,
                  'getPlacesAround() Unknown Error',
                ),
              );
          }
        })
        .catch(err => {
          if (err.json) {
            switch (err.json.status) {
              case 'OVER_QUERY_LIMIT':
                return reject(Server.fn.api.jsonError(429, `(Google) OVER_QUERY_LIMIT`));

              case 'REQUEST_DENIED':
                return reject(
                  Server.fn.api.jsonError(500, `(Google) REQUEST_DENIED`, 'REQUEST_DENIED'),
                );

              case 'INVALID_REQUEST':
                return reject(
                  Server.fn.api.jsonError(400, '(Google) Missing parameters (maybe pagetoken)'),
                );

              default:
                return reject(
                  Server.fn.api.jsonError(
                    500,
                    `Internal Server Error`,
                    'getPlacesAround() Unknown Error',
                  ),
                );
            }
          } else if (err == 'timeout')
            return reject(Server.fn.api.jsonError(524, '(Google) timeout'));
          else return reject(Server.fn.api.jsonError(500, '(Google) Network error'));
        });
    });
  },
};
