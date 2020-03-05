//=======================================================================//
//     OAUTH functions                                                   //
//=======================================================================//

module.exports = {
  getAPIKeyForFacebook(accessToken) {
    return new Promise((resolve, reject) => {
      if (accessToken) {
        // Get long-lived access token
        Server.fb.api(
          'oauth/access_token',
          {
            client_id: config.facebook.id,
            client_secret: config.facebook.secret,
            grant_type: 'fb_exchange_token',
            fb_exchange_token: accessToken,
          },
          function(res) {
            if (!res.error) {
              // Long-lived access token
              accessToken = res.access_token;

              Server.fb.api(
                '/me',
                {
                  fields: ['id', 'first_name', 'last_name', 'gender', 'birthday', 'email'],
                  access_token: accessToken,
                },
                function(data) {
                  if (!data.error) {
                    Server.fn.dbMethods.user
                      .userExist(data.id, 'facebook')
                      .then(user => {
                        if (!user) {
                          // Create new user

                          // Generate user API Key
                          const apiKey = Server.hat();

                          // Add new user to db
                          Server.fn.dbMethods.user
                            .createUser(
                              data.id,
                              null,
                              data.first_name,
                              data.last_name,
                              null,
                              'USER',
                              data.gender,
                              Server.moment(data.birthday, 'MM/DD/YYYY').unix(),
                              data.email,
                              accessToken,
                              apiKey,
                              'facebook',
                            )
                            .then(user => {
                              return resolve(
                                Server.fn.api.jsonSuccess(200, {
                                  id: user._id,
                                  socialID: user.id,
                                  apiKey: apiKey,
                                  created: true,
                                }),
                              );
                            })
                            .catch(err =>
                              reject(
                                Server.fn.api.jsonError(500, `'createUser()' Database error`, err),
                              ),
                            );
                        } else {
                          // Update user

                          // Update user accessToken
                          Server.fn.dbMethods.user
                            .editUserByID(user._id, {
                              accessToken: accessToken,
                            })
                            .catch(err => __logError(err));

                          return resolve(
                            Server.fn.api.jsonSuccess(200, {
                              id: user._id,
                              socialID: user.id,
                              apiKey: user.userAPIKey,
                              created: false,
                            }),
                          );
                        }
                      })
                      .catch(err =>
                        reject(Server.fn.api.jsonError(500, `'userExist()' Database error`, err)),
                      );
                  } else
                    return reject(Server.fn.api.jsonError(401, data.error.message, data.error));
                },
              );
            } else return reject(Server.fn.api.jsonError(401, res.error.message, res.error));
          },
        );
      } else return reject(Server.fn.api.jsonError(400, 'Missing access token'));
    });
  },

  getAPIKeyForGoogle(accessToken) {
    return new Promise((resolve, reject) => {
      if (accessToken) {
        Server.google.OAuth2.credentials = {
          access_token: accessToken,
        };

        Server.google.plus.people.get(
          {
            userId: 'me',
            auth: Server.google.OAuth2,
          },
          (err, data) => {
            if (!err) {
              Server.fn.dbMethods.user
                .userExist(data.id, 'google')
                .then(user => {
                  if (!user) {
                    // Create new user

                    // Generate user API Key
                    const apiKey = Server.hat();

                    // Add new user to db
                    Server.fn.dbMethods.user
                      .createUser(
                        data.id,
                        null,
                        data.name.givenName,
                        data.name.familyName,
                        null,
                        'USER',
                        data.gender,
                        Server.moment(data.birthday, 'MM/DD/YYYY').unix(),
                        data.emails[0] ? data.emails[0].value : undefined,
                        accessToken,
                        apiKey,
                        'google',
                      )
                      .then(user => {
                        return resolve(
                          Server.fn.api.jsonSuccess(200, {
                            id: user._id,
                            socialID: user.id,
                            apiKey: apiKey,
                            created: true,
                          }),
                        );
                      })
                      .catch(err =>
                        reject(Server.fn.api.jsonError(500, `'createUser()' Database error`, err)),
                      );
                  } else {
                    // Update user

                    // Update user accessToken
                    Server.fn.dbMethods.user
                      .editUserByID(user._id, {
                        accessToken: accessToken,
                      })
                      .catch(err => __logError(err));

                    return resolve(
                      Server.fn.api.jsonSuccess(200, {
                        id: user._id,
                        socialID: user.id,
                        apiKey: user.userAPIKey,
                        created: false,
                      }),
                    );
                  }
                })
                .catch(err =>
                  reject(Server.fn.api.jsonError(500, `'userExist()' Database error`, err)),
                );
            } else
              return reject(
                Server.fn.api.jsonError(
                  err.code || 500,
                  `Google: ${err.message || 'Internal Server Error'}`,
                  err,
                ),
              );
          },
        );
      } else return reject(Server.fn.api.jsonError(400, 'Missing access token'));
    });
  },

  resetAPIKey(_id) {
    return new Promise((resolve, reject) => {
      // Generate user API Key
      const apiKey = Server.hat();

      // Add new api key to user and resolve
      Server.fn.dbMethods.user
        .editUserByID(_id, {
          userAPIKey: apiKey,
        })
        .then(result =>
          resolve(
            Server.fn.api.jsonSuccess(200, {
              apiKey: apiKey,
            }),
          ),
        )
        .catch(err => reject(Server.fn.api.jsonError(500, `'editUserByID()' Database error`, err)));
    });
  },
};
