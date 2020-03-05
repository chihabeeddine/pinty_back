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
    //     Get news                                                          //
    //=======================================================================//

    router.get(['/place/:id/list', '/place/:id/list/:limit'], (req, res) => {
      Server.fn.routes.news
        .checkListNewsParameters(req.params)
        .then(params => Server.fn.routes.news.getPlaceNews(params.id, params.limit))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.get(['/user/:id/list', '/user/:id/list/:limit'], (req, res) => {
      Server.fn.routes.news
        .checkListNewsParameters(req.params)
        .then(params => Server.fn.routes.user.getPlacesIDs(params.id, params))
        .then(params => ((params.ids = params.ids[0].subPlaces), params))
        .then(params => Server.fn.routes.news.getPlacesNews(params.ids, params.limit))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     News create                                                       //
    //=======================================================================//

    router.put('/create', (req, res) => {
      Server.fn.routes.news
        .checkCreateNewsParameters(req.body)
        .then(news => Server.fn.routes.user.checkUserPerms(req.user, news.authorID, news))
        .then(news => Server.fn.routes.user.checkUserPermsPlace(req.user, news.placeID, news))
        .then(news => Server.fn.routes.news.createNews(news))
        .then(news => Server.fn.routes.news.addMedia(news))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     News by ID                                                        //
    //=======================================================================//

    const routerByID = express.Router();

    // middleware
    routerByID.use((req, res, next) => {
      next();
    });

    routerByID.patch('/:id/edit', (req, res) => {
      Server.fn.routes.news
        .checkEditNewsParameters(req.params, req.body)
        .then(news => Server.fn.routes.user.checkUserPermsPlace(req.user, news.placeID, news))
        .then(news => Server.fn.routes.news.editNews(news))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.delete('/:id/delete', (req, res) => {
      Server.fn.routes.news
        .checkNewsID(req.params)
        .then(id => Server.fn.routes.news.getNews(id))
        .then(news => Server.fn.routes.user.checkUserPermsPlace(req.user, news.placeID, news))
        .then(news => Server.fn.routes.news.deleteMedia(news))
        .then(news => Server.fn.routes.news.deleteNews(news.id))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/id', routerByID);

    return router;
  },
};
