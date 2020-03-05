//=======================================================================//
//     SEARCH functions                                                  //
//=======================================================================//

module.exports = {
  checkQuerySearchParams(body) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (body.query && body.query.length > 0) {
        let params = {
          query: body.query,
        };

        return resolve(params);
      } else return reject(Server.fn.api.jsonError(400, 'Missing parameters'));
    });
  },

  // Search places with parameters
  getPlacesByText(user, query) {
    let requestParams = {
      query,
    };

    return this.getPlacesSearch(user, requestParams);
  },

  // Get more places using query and page token (from before)
  getPlacesByTextWithToken(user, query, pagetoken) {
    let requestParams = {
      query,
      pagetoken,
    };

    return this.getPlacesSearch(user, requestParams);
  },

  getPlacesSearch(user, requestParams) {
    return new Promise((resolve, reject) => {
      Server.google.maps
        .places(requestParams)
        .asPromise()
        .then(async response => {
          switch (response.json.status) {
            case 'OK':
              let responseData = {
                results: await Server.fn.routes.place.formatedPlaces(user, response.json.results),
              };

              if (response.json.next_page_token)
                responseData.nextPageToken = response.json.next_page_token;

              if (responseData.results == null)
                return reject(
                  Server.fn.api.jsonError(500, `Create/Update place Database error`, responseData),
                );
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
                  'getPlacesSearch() Unknown Error',
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
                    'getPlacesSearch() Unknown Error',
                  ),
                );
            }
          } else if (err == 'timeout')
            return reject(Server.fn.api.jsonError(524, '(Google) timeout'), err);
          else return reject(Server.fn.api.jsonError(500, '(Google) Network error'));
        });
    });
  },

  // Search users with parameters
  getUsersByText(user, query) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.user
        .searchUsers(query)
        .then(dbUsers => {
          let users = [];

          for (let dbUser of dbUsers) {
            users.push({
              id: dbUser._id,
              username: dbUser.userName,
              firstname: dbUser.firstName,
              lastname: dbUser.lastName,
              image: dbUser.image,
              role: dbUser.role,
            });
          }
          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: users,
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'searchUsers()' Database error`, err)));
    });
  },
};
