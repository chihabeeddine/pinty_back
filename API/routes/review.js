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
    //     Review create                                                     //
    //=======================================================================//

    router.put('/create', (req, res) => {
      Server.fn.routes.review
        .checkRouteReview(req.body)
        .then(review => Server.fn.routes.user.checkUserPerms(req.user, review.authorID, review))
        .then(review => Server.fn.routes.review.createReview(review))
        .then(review => Server.fn.routes.review.addMedia(review))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Review by ID routes                                               //
    //=======================================================================//

    const routerByID = express.Router();

    // middleware
    routerByID.use((req, res, next) => {
      next();
    });

    routerByID.delete('/:id/delete', (req, res) => {
      Server.fn.routes.review
        .checkRouteReviewID(req.params)
        .then(id => Server.fn.routes.review.getReview(id))
        .then(review => Server.fn.routes.user.checkUserPerms(req.user, review.authorID, review))
        .then(review => Server.fn.routes.review.deleteMedia(review))
        .then(review => Server.fn.routes.review.deleteReview(review.id))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.patch('/:id/review/edit', (req, res) => {
      Server.fn.routes.review
        .checkRouteReviewParam(req.params, req.body)
        .then(review => Server.fn.routes.user.checkUserPerms(req.user, review.authorID, review))
        .then(review => Server.fn.routes.review.editReview(review))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/id', routerByID);

    //=======================================================================//
    //     Pending reviews routes                                            //
    //=======================================================================//

    const routerPendingReviews = express.Router();

    // middleware
    routerPendingReviews.use((req, res, next) => {
      next();
    });

    routerPendingReviews.put('/:userID/add/:placeID', (req, res) => {
      Server.fn.routes.user
        .checkRoutePending(req.params)
        .then(params => Server.fn.routes.user.checkUserPerms(req.user, params.userID, params))
        .then(params => Server.fn.routes.user.addPendingReview(params.userID, params.placeID))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerPendingReviews.get('/:userID/list', (req, res) => {
      Server.fn.routes.user
        .checkRouteProfilePending(req.params)
        .then(id => Server.fn.routes.user.checkUserPerms(req.user, id, id))
        .then(id => Server.fn.routes.user.getPendingReviewsIDs(id))
        .then(ids => Server.fn.routes.user.getPendingReviews(ids.data))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerPendingReviews.delete('/:userID/delete/:placeID', (req, res) => {
      Server.fn.routes.user
        .checkRoutePending(req.params)
        .then(params => Server.fn.routes.user.checkUserPerms(req.user, params.userID, params))
        .then(params => Server.fn.routes.user.deletePendingReview(params.userID, params.placeID))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/pending', routerPendingReviews);

    //=======================================================================//
    //     Other routes                                                      //
    //=======================================================================//

    return router;
  },
};
