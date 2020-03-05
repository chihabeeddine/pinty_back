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
    //     Around routes                                                     //
    //=======================================================================//

    const routerAround = express.Router();

    // middleware
    routerAround.use((req, res, next) => {
      next();
    });

    routerAround.post('/list', (req, res) => {
      Server.fn.routes.place
        .checkRouteAroundParameters(req.body)
        .then(params =>
          Server.fn.routes.place.getPlacesAround(
            req.user,
            params.longitude,
            params.latitude,
            params.radius,
            params.type,
          ),
        )
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerAround.post('/list/:pagetoken', (req, res) => {
      Server.fn.routes.place
        .checkRouteAroundParameters(req.body)
        .then(params =>
          Server.fn.routes.place.getPlacesAroundToken(
            req.user,
            params.longitude,
            params.latitude,
            req.params.pagetoken,
          ),
        )
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/around', routerAround);

    //=======================================================================//
    //     Place by ID routes                                                //
    //=======================================================================//

    const routerByID = express.Router();

    // middleware
    routerByID.use((req, res, next) => {
      next();
    });

    routerByID.get('/:id/info', (req, res) => {
      Server.fn.routes.place
        .getPlaceInfo(req.params.id, req.user)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.get(['/:id/reviews', '/:id/reviews/limit/:limit'], (req, res) => {
      Server.fn.routes.place
        .checkPlaceItemsParameters(req.params)
        .then(params => Server.fn.routes.place.getPlaceReviews(req.user, params.id, params.limit))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.get(['/:id/medias', '/:id/medias/limit/:limit'], (req, res) => {
      Server.fn.routes.place
        .checkPlaceItemsParameters(req.params)
        .then(params => Server.fn.routes.place.getPlaceMedias(req.user, params.id, params.limit))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/id', routerByID);

    //=======================================================================//
    //     Other routes                                                      //
    //=======================================================================//

    return router;
  },
};
