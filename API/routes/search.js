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
    //     Search places                                                     //
    //=======================================================================//

    router.post('/places', (req, res) => {
      Server.fn.routes.search
        .checkQuerySearchParams(req.body)
        .then(params => Server.fn.routes.search.getPlacesByText(req.user, params.query))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.post('/places/:pagetoken', (req, res) => {
      Server.fn.routes.search
        .checkQuerySearchParams(req.body)
        .then(params =>
          Server.fn.routes.search.getPlacesByTextWithToken(
            req.user,
            params.query,
            req.params.pagetoken,
          ),
        )
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Search users                                                      //
    //=======================================================================//

    router.post('/users', (req, res) => {
      Server.fn.routes.search
        .checkQuerySearchParams(req.body)
        .then(params => Server.fn.routes.search.getUsersByText(req.user, params.query))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Other routes                                                      //
    //=======================================================================//

    return router;
  },
};
