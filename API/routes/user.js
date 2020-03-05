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
    //     User by ID routes                                                 //
    //=======================================================================//

    const routerByID = express.Router();

    // middleware
    routerByID.use((req, res, next) => {
      next();
    });

    /* Profile */

    routerByID.get('/:id/profile', (req, res) => {
      Server.fn.routes.user
        .checkRouteProfileID(req.params)
        .then(id => Server.fn.routes.user.checkUserPerms(req.user, id, id))
        .then(id => Server.fn.routes.user.getUserProfile(id, true)) // true : private
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.get('/:id/profile/public', (req, res) => {
      Server.fn.routes.user
        .checkRouteProfileID(req.params)
        .then(id => Server.fn.routes.user.getUserProfile(id, false)) // false : public
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.patch('/:id/profile/edit', (req, res) => {
      Server.fn.routes.user
        .checkRouteEditProfileParameters(req.params, req.body)
        .then(user => Server.fn.routes.user.checkUserPerms(req.user, user._id, user))
        .then(Server.fn.routes.user.saveNewProfilePicture)
        .then(Server.fn.routes.user.editUser)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    /* Reviews */

    routerByID.get(['/:id/reviews', '/:id/reviews/limit/:limit'], (req, res) => {
      Server.fn.routes.place
        .checkPlaceItemsParameters(req.params)
        .then(params => Server.fn.routes.user.getUserReviews(req.user, params.id, params.limit))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    /* Friend */

    routerByID.get('/:id/friend/list', (req, res) => {
      Server.fn.routes.user
        .checkRouteProfileID(req.params)
        .then(id => Server.fn.routes.user.getFriendsIDs(id))
        .then(ids => Server.fn.routes.user.getFriends(ids))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.put('/:id/friend/add/:friendID', (req, res) => {
      Server.fn.routes.user
        .checkRouteFriendIDs(req.params)
        .then(params => Server.fn.routes.user.checkUserPerms(req.user, params.id, params))
        .then(params => Server.fn.routes.user.addFriend(params.id, params.friendID))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.delete('/:id/friend/delete/:friendID', (req, res) => {
      Server.fn.routes.user
        .checkRouteFriendIDs(req.params)
        .then(params => Server.fn.routes.user.checkUserPerms(req.user, params.id, params))
        .then(params => Server.fn.routes.user.deleteFriend(params.id, params.friendID))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    router.use('/id', routerByID);

    /* Subs */

    routerByID.get('/:id/sub/place/list', (req, res) => {
      Server.fn.routes.user
        .checkRouteProfileID(req.params)
        .then(id => Server.fn.routes.user.getPlacesIDs(id))
        .then(ids => Server.fn.routes.user.getPlaces(ids))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.put('/:id/sub/place/add/:placeID', (req, res) => {
      Server.fn.routes.user
        .checkRoutePlaceIDs(req.params)
        .then(params => Server.fn.routes.user.checkUserPerms(req.user, params.id, params))
        .then(params => Server.fn.routes.user.addSubPlace(params.id, params.placeID))
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err));
    });

    routerByID.delete('/:id/sub/place/delete/:placeID', (req, res) => {
      Server.fn.routes.user
        .checkRoutePlaceIDs(req.params)
        .then(params => Server.fn.routes.user.checkUserPerms(req.user, params.id, params))
        .then(params => Server.fn.routes.user.deleteSubPlace(params.id, params.placeID))
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
