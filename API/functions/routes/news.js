//=======================================================================//
//     News functions                                                    //
//=======================================================================//

module.exports = {
  /* Checkers */

  checkNewsID(URLparams) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (URLparams.id && URLparams.id.match(/^[0-9a-fA-F]{24}$/)) resolve(URLparams.id);
      // Check good ObjectID
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing id'));
    });
  },

  checkListNewsParameters(URLparams) {
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

  checkCreateNewsParameters(params) {
    return new Promise((resolve, reject) => {
      let news = {
        authorID: null,
        placeID: null,
        title: null,
        content: null,
        medias: [],
      };

      // Check mandatory params
      if (params.authorID && params.authorID.match(/^[0-9a-fA-F]{24}$/))
        news.authorID = params.authorID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing author ID'));

      if (params.placeID && params.placeID.match(/^[0-9a-fA-F]{24}$/))
        news.placeID = params.placeID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing place ID'));

      if (params.title && params.title.trim() != '') news.title = params.title.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing title'));

      if (params.content && params.content.trim() != '') news.content = params.content.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing content'));

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
              news.medias.push({
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

      resolve(news);
    });
  },

  checkEditNewsParameters(URLparams, params) {
    return new Promise((resolve, reject) => {
      let news = {
        id: null,
        authorID: null,
        placeID: null,
        title: null,
        content: null,
      };

      // Check mandatory params
      if (URLparams.id && URLparams.id.match(/^[0-9a-fA-F]{24}$/)) news.id = URLparams.id;
      // Check good ObjectID
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing id'));

      if (params.authorID && params.authorID.match(/^[0-9a-fA-F]{24}$/))
        news.authorID = params.authorID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing author ID'));

      if (params.placeID && params.placeID.match(/^[0-9a-fA-F]{24}$/))
        news.placeID = params.placeID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing place ID'));

      if (params.title && params.title.trim() != '') news.title = params.title.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing title'));

      if (params.content && params.content.trim() != '') news.content = params.content.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing content'));

      resolve(news);
    });
  },

  /* Functions */

  async formatedNews(dbNews) {
    let news = [];

    try {
      for (let dbNew of dbNews) {
        let user = await Server.fn.dbMethods.user.getUserByID(dbNew.authorID);
        let placeInfo = await Server.fn.dbMethods.place.getPlaceByID(dbNew.placeID.toString());

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

        news.push({
          id: dbNew._id,
          author: author,
          place: place,
          title: dbNew.title,
          content: dbNew.content,
          medias: dbNew.medias ? dbNew.medias.map(media => config.media.url + media) : [],
          created: Server.moment(dbNew.createdAt).valueOf(),
        });
      }
    } catch (e) {
      __logError(e);
      return null;
    }

    return news;
  },

  // Get news for a place
  getPlaceNews(id, limit) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.news
        .getNewsOrderByDesc(
          {
            placeID: id,
          },
          limit,
        )
        .then(async dbNews => {
          let news = await this.formatedNews(dbNews);
          if (news == null)
            return reject(Server.fn.api.jsonError(500, `getUserByID() Database error`));

          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: news,
            }),
          );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'getPlaceNews()' Database error`, err)));
    });
  },

  // Get news for places
  getPlacesNews(ids, limit) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.news
        .getNewsIn(ids, limit)
        .then(async dbNews => {
          let news = await this.formatedNews(dbNews);
          if (news == null)
            return reject(Server.fn.api.jsonError(500, `getUserByID() Database error`));

          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: news,
            }),
          );
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'getPlacesNews()' Database error`, err)),
        );
    });
  },

  // Create a news
  createNews(news) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.news
        .createNews(_.omit(news, ['medias']))
        .then(createdNews => {
          Server.fn.dbMethods.place
            .getPlaceByID(createdNews.placeID.toString())
            .then(placeInfo => {
              let place = placeInfo
                ? {
                    id: placeInfo._id,
                    name: placeInfo.name,
                    image: placeInfo.image,
                  }
                : null;

              return resolve({
                id: createdNews._id,
                authorID: createdNews.authorID,
                title: createdNews.title,
                content: createdNews.content,
                place: place,
                medias: news.medias,
                created: Server.moment(createdNews.createdAt).valueOf(),
              });
            })
            .catch(err =>
              reject(
                Server.fn.api.jsonError(500, `'createNews()' Database error (getPlaceByID)`, err),
              ),
            );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'createNews()' Database error`, err)));
    });
  },

  addMedia(news) {
    return new Promise(async (resolve, reject) => {
      for (const i in news.medias) {
        const media = news.medias[i];
        let dest, filePath;
        try {
          dest = Server.makeDir.sync(
            `${config.root}${config.media.path.root}${config.media.path.news}/${news.id}`,
          ); // Create dir if doesn't exist
          filePath = `${dest}/${Server.hat(32)}.${Server.mime.extension(media.type)}`;

          Server.fs.writeFileSync(filePath, media.base64, {
            encoding: 'base64',
          }); // Save file
          delete media.base64; // Delete base64 media from object
        } catch (e) {
          return reject(Server.fn.api.jsonError(400, 'Add media error', e));
        }

        filePath = filePath.replace(`${config.root}${config.media.path.root}`, '');
        news.medias[i] = config.media.url + filePath;
      }

      // Add medias to news
      await Server.fn.dbMethods.news
        .editNewsByID(news.id, {
          medias: news.medias.map(media => media.replace(`${config.media.url}`, '')),
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'editNewsByID()' Database error`, err)));

      return resolve(Server.fn.api.jsonSuccess(200, news));
    });
  },

  editNews(news) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.news
        .editNewsByID(news.id, _.omit(news, ['id', 'authorID', 'placeID']))
        .then(commandResult => {
          Server.fn.dbMethods.news
            .getNewsByID(news.id)
            .then(dbNews => {
              if (dbNews) {
                Server.fn.dbMethods.place
                  .getPlaceByID(dbNews.placeID.toString())
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
                        id: dbNews._id,
                        authorID: dbNews.authorID,
                        title: dbNews.title,
                        content: dbNews.content,
                        place: place,
                        medias: dbNews.medias.map(media => config.media.url + media),
                        created: Server.moment(dbNews.createdAt).valueOf(),
                      }),
                    );
                  });
              } else
                reject(Server.fn.api.jsonError(404, `Can't find a news associated to this id`));
            })
            .catch(err =>
              reject(Server.fn.api.jsonError(404, `Can't find a news associated to this id`, err)),
            );
        })
        .catch(err => reject(Server.fn.api.jsonError(404, `Can't update the news`, err)));
    });
  },

  deleteMedia(news) {
    return new Promise(async (resolve, reject) => {
      try {
        await Server.fs.removeSync(
          `${config.root}${config.media.path.root}${config.media.path.news}/${news.id}`,
        );
      } catch (err) {
        return reject(
          Server.fn.api.jsonError(500, `Can't find medias associated to this news id`, err),
        );
      }
      resolve(news);
    });
  },

  getNews(id) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.news
        .getNewsByID(id)
        .then(dbNews => {
          if (dbNews) {
            return resolve({
              id: dbNews._id,
              authorID: dbNews.authorID,
              placeID: dbNews.placeID,
            });
          } else reject(Server.fn.api.jsonError(404, `Can't find a news associated to this id`));
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(404, `Can't find a news associated to this id`, err)),
        );
    });
  },

  deleteNews(id) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.news
        .deleteNewsByID(id)
        .then(results => resolve(Server.fn.api.jsonSuccess(200, true)))
        .catch(err =>
          reject(Server.fn.api.jsonError(404, `Can't delete the news associated to this id`, err)),
        );
    });
  },
};
