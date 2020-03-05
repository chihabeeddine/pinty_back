//=======================================================================//
//     Event functions                                                   //
//=======================================================================//

module.exports = {
  /* Checkers */

  checkEventID(URLparams) {
    return new Promise((resolve, reject) => {
      // Check mandatory params
      if (URLparams.id && URLparams.id.match(/^[0-9a-fA-F]{24}$/)) resolve(URLparams.id);
      // Check good ObjectID
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing id'));
    });
  },

  checkListEventParameters(URLparams) {
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

  checkCreateEventParameters(params) {
    return new Promise((resolve, reject) => {
      let event = {
        authorID: null,
        placeID: null,
        title: null,
        content: null,
        start: 0,
        end: 0,
        medias: [],
      };

      // Check mandatory params
      if (params.authorID && params.authorID.match(/^[0-9a-fA-F]{24}$/))
        event.authorID = params.authorID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing author ID'));

      if (params.placeID && params.placeID.match(/^[0-9a-fA-F]{24}$/))
        event.placeID = params.placeID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing place ID'));

      if (params.title && params.title.trim() != '') event.title = params.title.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing title'));

      if (params.content && params.content.trim() != '') event.content = params.content.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing content'));

      if (params.start && parseInt(params.start, 10) != NaN)
        event.start = parseInt(params.start, 10);
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing start'));

      if (params.end && parseInt(params.end, 10) != NaN) event.end = parseInt(params.end, 10);
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing end'));

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
              event.medias.push({
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

      resolve(event);
    });
  },

  checkEditEventParameters(URLparams, params) {
    return new Promise((resolve, reject) => {
      let event = {
        id: null,
        authorID: null,
        placeID: null,
        title: null,
        content: null,
        start: 0,
        end: 0,
      };

      // Check mandatory params
      if (URLparams.id && URLparams.id.match(/^[0-9a-fA-F]{24}$/)) event.id = URLparams.id;
      // Check good ObjectID
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing id'));

      if (params.authorID && params.authorID.match(/^[0-9a-fA-F]{24}$/))
        event.authorID = params.authorID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing author ID'));

      if (params.placeID && params.placeID.match(/^[0-9a-fA-F]{24}$/))
        event.placeID = params.placeID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing place ID'));

      if (params.title && params.title.trim() != '') event.title = params.title.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing title'));

      if (params.content && params.content.trim() != '') event.content = params.content.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing content'));

      if (params.start && parseInt(params.start, 10) != NaN)
        event.start = parseInt(params.start, 10);
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing start'));

      if (params.end && parseInt(params.end, 10) != NaN) event.end = parseInt(params.end, 10);
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing end'));

      resolve(event);
    });
  },

  /* Functions */

  async formatedEvents(dbEvents) {
    let events = [];

    try {
      for (let dbEvent of dbEvents) {
        let user = await Server.fn.dbMethods.user.getUserByID(dbEvent.authorID);
        let placeInfo = await Server.fn.dbMethods.place.getPlaceByID(dbEvent.placeID.toString());

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

        events.push({
          id: dbEvent._id,
          author: author,
          place: place,
          title: dbEvent.title,
          content: dbEvent.content,
          start: dbEvent.start,
          end: dbEvent.end,
          expired: dbEvent.end - Date.now() < 0,
          medias: dbEvent.medias ? dbEvent.medias.map(media => config.media.url + media) : [],
          created: Server.moment(dbEvent.createdAt).valueOf(),
        });
      }
    } catch (e) {
      __logError(e);
      return null;
    }

    return events;
  },

  // Get events for a place
  getPlaceEvents(id, limit) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.event
        .getEventsOrderByDesc(
          {
            placeID: id,
          },
          limit,
        )
        .then(async dbEvents => {
          let events = await this.formatedEvents(dbEvents);
          if (events == null)
            return reject(Server.fn.api.jsonError(500, `getUserByID() Database error`));

          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: events,
            }),
          );
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'getPlaceEvents()' Database error`, err)),
        );
    });
  },

  // Get events for places
  getPlacesEvents(ids, limit) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.event
        .getEventsIn(ids, limit)
        .then(async dbEvents => {
          let events = await this.formatedEvents(dbEvents);
          if (events == null)
            return reject(Server.fn.api.jsonError(500, `getUserByID() Database error`));

          return resolve(
            Server.fn.api.jsonSuccess(200, {
              results: events,
            }),
          );
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'getPlacesEvents()' Database error`, err)),
        );
    });
  },

  // Create an event
  createEvent(event) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.event
        .createEvent(_.omit(event, ['medias']))
        .then(createdEvent => {
          Server.fn.dbMethods.place
            .getPlaceByID(createdEvent.placeID.toString())
            .then(placeInfo => {
              let place = placeInfo
                ? {
                    id: placeInfo._id,
                    name: placeInfo.name,
                    image: placeInfo.image,
                  }
                : null;

              return resolve({
                id: createdEvent._id,
                authorID: createdEvent.authorID,
                title: createdEvent.title,
                content: createdEvent.content,
                start: createdEvent.start,
                end: createdEvent.end,
                expired: createdEvent.end - Date.now() < 0,
                place: place,
                medias: event.medias,
                created: Server.moment(createdEvent.createdAt).valueOf(),
              });
            })
            .catch(err =>
              reject(
                Server.fn.api.jsonError(500, `'createEvent()' Database error (getPlaceByID)`, err),
              ),
            );
        })
        .catch(err => reject(Server.fn.api.jsonError(500, `'createEvent()' Database error`, err)));
    });
  },

  addMedia(event) {
    return new Promise(async (resolve, reject) => {
      for (const i in event.medias) {
        const media = event.medias[i];
        let dest, filePath;
        try {
          dest = Server.makeDir.sync(
            `${config.root}${config.media.path.root}${config.media.path.event}/${event.id}`,
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
        event.medias[i] = config.media.url + filePath;
      }

      // Add medias to event
      await Server.fn.dbMethods.event
        .editEventByID(event.id, {
          medias: event.medias.map(media => media.replace(`${config.media.url}`, '')),
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'editEventByID()' Database error`, err)),
        );

      return resolve(Server.fn.api.jsonSuccess(200, event));
    });
  },

  editEvent(event) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.event
        .editEventByID(event.id, _.omit(event, ['id', 'authorID', 'placeID']))
        .then(commandResult => {
          Server.fn.dbMethods.event
            .getEventByID(event.id)
            .then(dbEvent => {
              if (dbEvent) {
                Server.fn.dbMethods.place
                  .getPlaceByID(dbEvent.placeID.toString())
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
                        id: dbEvent._id,
                        authorID: dbEvent.authorID,
                        title: dbEvent.title,
                        content: dbEvent.content,
                        start: dbEvent.start,
                        end: dbEvent.end,
                        expired: dbEvent.end - Date.now() < 0,
                        place: place,
                        medias: dbEvent.medias.map(media => config.media.url + media),
                        created: Server.moment(dbEvent.createdAt).valueOf(),
                      }),
                    );
                  });
              } else
                reject(Server.fn.api.jsonError(404, `Can't find an event associated to this id`));
            })
            .catch(err =>
              reject(
                Server.fn.api.jsonError(404, `Can't find an event associated to this id`, err),
              ),
            );
        })
        .catch(err => reject(Server.fn.api.jsonError(404, `Can't update the event`, err)));
    });
  },

  deleteMedia(event) {
    return new Promise(async (resolve, reject) => {
      try {
        await Server.fs.removeSync(
          `${config.root}${config.media.path.root}${config.media.path.event}/${event.id}`,
        );
      } catch (err) {
        return reject(
          Server.fn.api.jsonError(500, `Can't find medias associated to this event id`, err),
        );
      }
      resolve(event);
    });
  },

  getEvent(id) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.event
        .getEventByID(id)
        .then(dbEvent => {
          if (dbEvent) {
            return resolve({
              id: dbEvent._id,
              authorID: dbEvent.authorID,
              placeID: dbEvent.placeID,
            });
          } else reject(Server.fn.api.jsonError(404, `Can't find an event associated to this id`));
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(404, `Can't find an event associated to this id`, err)),
        );
    });
  },

  deleteEvent(id) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.event
        .deleteEventByID(id)
        .then(results => resolve(Server.fn.api.jsonSuccess(200, true)))
        .catch(err =>
          reject(Server.fn.api.jsonError(404, `Can't delete the event associated to this id`, err)),
        );
    });
  },
};
