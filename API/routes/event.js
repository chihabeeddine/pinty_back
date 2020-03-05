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
    //     Get events                                                        //
    //=======================================================================//

    router.get(['/place/:id/list', '/place/:id/list/:limit'], (req, res) => {
      Server.fn.routes.event
        .checkListEventParameters(req.params)
        .then(params => Server.fn.routes.event.getPlaceEvents(params.id, params.limit))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.get(['/user/:id/list', '/user/:id/list/:limit'], (req, res) => {
      Server.fn.routes.event
        .checkListEventParameters(req.params)
        .then(params => Server.fn.routes.user.getPlacesIDs(params.id, params))
        .then(params => ((params.ids = params.ids[0].subPlaces), params))
        .then(params => Server.fn.routes.event.getPlacesEvents(params.ids, params.limit))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Event create                                                      //
    //=======================================================================//

    router.put('/create', (req, res) => {
      Server.fn.routes.event
        .checkCreateEventParameters(req.body)
        .then(event => Server.fn.routes.user.checkUserPerms(req.user, event.authorID, event))
        .then(event => Server.fn.routes.user.checkUserPermsPlace(req.user, event.placeID, event))
        .then(event => Server.fn.routes.event.createEvent(event))
        .then(event => Server.fn.routes.event.addMedia(event))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    //=======================================================================//
    //     Events by ID                                                        //
    //=======================================================================//

    const routerByID = express.Router();

    // middleware
    routerByID.use((req, res, next) => {
      next();
    });

    routerByID.patch('/:id/edit', (req, res) => {
      Server.fn.routes.event
        .checkEditEventParameters(req.params, req.body)
        .then(event => Server.fn.routes.user.checkUserPermsPlace(req.user, event.placeID, event))
        .then(event => Server.fn.routes.event.editEvent(event))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.delete('/:id/delete', (req, res) => {
      Server.fn.routes.event
        .checkEventID(req.params)
        .then(id => Server.fn.routes.event.getEvent(id))
        .then(event => Server.fn.routes.user.checkUserPermsPlace(req.user, event.placeID, event))
        .then(event => Server.fn.routes.event.deleteMedia(event))
        .then(event => Server.fn.routes.event.deleteEvent(event.id))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/id', routerByID);

    return router;
  },
};
