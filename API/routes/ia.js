module.exports = {
  router: function (express, routeName) {
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
    //     Suggestion by ID                                                  //
    //=======================================================================//

    const routerBySuggestion = express.Router();

    // middleware
    routerBySuggestion.use((req, res, next) => {
      next();
    });

    routerBySuggestion.post('/:id/', (req, res) => {
      Server.fn.routes.user
        .checkRouteProfileID(req.params)
        .then(id => Server.fn.routes.ia.checkRouteAroundParametersID(id, req.body))
        .then(params => Server.fn.routes.user.getUserPreference(req.user, params.id, params, null))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerBySuggestion.patch('/:id/note', (req, res) => {
      Server.fn.routes.ia
        .checkNoteSuggestionParameters(req.params, req.body)
        .then(suggestion =>
          Server.fn.routes.user.checkUserPerms(req.user, suggestion.userID, suggestion),
        )
        .then(suggestion => Server.fn.routes.ia.editSuggestion(suggestion))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/suggestion', routerBySuggestion);

    //=======================================================================//
    //     Form by ID                                                        //
    //=======================================================================//

    const routerForm = express.Router();

    // middleware
    routerForm.use((req, res, next) => {
      next();
    });

    routerForm.post('/:id/', (req, res) => {
      Server.fn.routes.user
        .checkRouteProfileID(req.params)
        .then(id => Server.fn.routes.ia.checkRouteFormParametersID(id, req.body))
        .then(params => Server.fn.routes.ia.updateUserPrefFromSurvey(params))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/form', routerForm);

    return router;
  },
};