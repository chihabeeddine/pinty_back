//=======================================================================//
//     Feedback functions                                                //
//=======================================================================//

module.exports = {
  /* Checkers */

  checkCreateFeedBackParameters(params) {
    return new Promise((resolve, reject) => {
      let feedback = {
        authorID: null,
        title: null,
        content: null,
        medias: [],
      };

      // Check mandatory params
      if (params.authorID && params.authorID.match(/^[0-9a-fA-F]{24}$/))
        feedback.authorID = params.authorID;
      else return reject(Server.fn.api.jsonError(400, 'Bad or Missing author ID'));

      if (params.title && params.title.trim() != '') feedback.title = params.title.trim();
      else reject(Server.fn.api.jsonError(400, 'Bad or Missing title'));

      if (params.content && params.content.trim() != '') feedback.content = params.content.trim();
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
              feedback.medias.push({
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

      resolve(feedback);
    });
  },

  /* Functions */

  // Create a feedback
  createFeedback(feedback) {
    return new Promise((resolve, reject) => {
      Server.fn.dbMethods.feedback
        .createFeedback(_.omit(feedback, ['medias']))
        .then(createdFeedback => {
          return resolve({
            id: createdFeedback._id,
            authorID: createdFeedback.authorID,
            title: createdFeedback.title,
            content: createdFeedback.content,
            medias: feedback.medias,
            created: Server.moment(createdFeedback.createdAt).valueOf(),
          });
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'createFeedback()' Database error`, err)),
        );
    });
  },

  addMedia(feedback) {
    return new Promise(async (resolve, reject) => {
      for (const i in feedback.medias) {
        const media = feedback.medias[i];
        let dest, filePath;
        try {
          dest = Server.makeDir.sync(
            `${config.root}${config.media.path.root}${config.media.path.feedback}/${feedback.id}`,
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
        feedback.medias[i] = config.media.url + filePath;
      }

      // Add medias to feedback
      await Server.fn.dbMethods.feedback
        .editFeedbackByID(feedback.id, {
          medias: feedback.medias.map(media => media.replace(`${config.media.url}`, '')),
        })
        .catch(err =>
          reject(Server.fn.api.jsonError(500, `'editFeedbackByID()' Database error`, err)),
        );

      return resolve(Server.fn.api.jsonSuccess(200, feedback));
    });
  },
};
