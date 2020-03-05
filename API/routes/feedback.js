module.exports = {
  router: function(express, routeName) {
    const router = express.Router();

    // middleware that is specific to this router
    router.use((req, res, next) => {
      // Check user permissions
      Server.fn.api
        .checkUserAuthorization('ALL', req.headers.pinty_id, req.headers.pinty_key)
        .then(user => {
          req.user = user;
          next();
        }) // Go to the routes
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Feedback                                                          //
    //=======================================================================//

    router.put('/create', (req, res) => {
      Server.fn.routes.feedback
        .checkCreateFeedBackParameters(req.body)
        .then(feedback =>
          Server.fn.routes.user.checkUserPerms(req.user, feedback.authorID, feedback),
        )
        .then(feedback => Server.fn.routes.feedback.createFeedback(feedback))
        .then(feedback => Server.fn.routes.feedback.addMedia(feedback))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Other routes                                                      //
    //=======================================================================//

    return router;
  },
};
