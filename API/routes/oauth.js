module.exports = {
  router: function(express, routeName) {
    const router = express.Router();

    // middleware that is specific to this router
    router.use((req, res, next) => {
      next();
    });

    //=======================================================================//
    //     Facebook routes                                                   //
    //=======================================================================//

    const routerFacebook = express.Router();

    // middleware
    routerFacebook.use((req, res, next) => {
      next();
    });

    /**
     * Send access tokens
     *
     * POST /oauth/facebook
     * POST /oauth/facebook/login
     *
     * @param {object} tokens {
     *  "accessToken": "xxxxxx"
     * }
     */
    routerFacebook.post(['/', '/login'], (req, res) => {
      Server.fn.routes.oauth
        .getAPIKeyForFacebook(req.body.accessToken)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/facebook', routerFacebook);

    //=======================================================================//
    //     Google routes                                                     //
    //=======================================================================//

    const routerGoogle = express.Router();

    // middleware
    routerGoogle.use((req, res, next) => {
      next();
    });

    /**
     * Send access token
     *
     * POST /oauth/google
     * POST /oauth/google/login
     *
     * @param {object} tokens {
     *  "accessToken": "xxxxxx"
     * }
     */
    routerGoogle.post(['/', '/login'], (req, res) => {
      Server.fn.routes.oauth
        .getAPIKeyForGoogle(req.body.accessToken)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/google', routerGoogle);

    //=======================================================================//
    //     Other routes                                                      //
    //=======================================================================//

    /**
     * Reset user API Key
     *
     * Perms : ALL
     *
     * PATCH /oauth/reset/apikey
     *
     * @header {
     *  "pinty_id": "xxxxxx",
     * 	"pinty_key": "xxxxxx"
     * }
     */
    router.patch('/reset/apikey', (req, res) => {
      // Check user permissions
      Server.fn.api
        .checkUserAuthorization('ALL', req.headers.pinty_id, req.headers.pinty_key)
        .then(user => Server.fn.routes.oauth.resetAPIKey(user._id)) // Reset API Key
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    /**
     * Reset user API Key by id
     *
     * Perms : ADMIN
     *
     * PATCH /oauth/reset/apikey/{pinty_id}
     *
     * @header {
     *  "pinty_id": "xxxxxx",
     * 	"pinty_key": "xxxxxx"
     * }
     */
    router.patch('/reset/apikey/:id', (req, res) => {
      // Check user permissions
      Server.fn.api
        .checkUserAuthorization('ADMIN', req.headers.pinty_id, req.headers.pinty_key)
        .then(user => Server.fn.routes.oauth.resetAPIKey(req.params.id)) // Reset API Key
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Return route	                                                     //
    //=======================================================================//

    return router;
  },
};
