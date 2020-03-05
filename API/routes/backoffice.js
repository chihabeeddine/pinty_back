module.exports = {
  router: function(express, routeName) {
    const router = express.Router();

    // middleware that is specific to this router
    router.use((req, res, next) => {
      // Check user permissions
      Server.fn.api
        .checkUserAuthorization('ADMIN', req.headers.pinty_id, req.headers.pinty_key)
        .then(user => {
          req.user = user;
          next();
        }) // Go to the routes
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Lists                                                             //
    //=======================================================================//

    router.get('/user/list', (req, res) => {
      Server.fn.routes.backoffice
        .checkListUsersParameters(req.query)
        .then(filters => Server.fn.routes.backoffice.getUsers(filters))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.get('/place/list', (req, res) => {
      Server.fn.routes.backoffice
        .checkListPlacesParameters(req.query)
        .then(filters => Server.fn.routes.backoffice.getPlaces(filters))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.get('/media/list', (req, res) => {
      Server.fn.routes.backoffice
        .checkListMediasParameters(req.query)
        .then(filters => Server.fn.routes.backoffice.getMedias(filters))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.get('/feedback/list', (req, res) => {
      Server.fn.routes.backoffice
        .checkListFeedbacksParameters(req.query)
        .then(filters => Server.fn.routes.backoffice.getFeedbacks(filters))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.get('/review/list', (req, res) => {
      Server.fn.routes.backoffice
        .checkListReviewsParameters(req.query)
        .then(filters => Server.fn.routes.backoffice.getReviews(filters))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Other routes                                                      //
    //=======================================================================//

    return router;
  },
};
