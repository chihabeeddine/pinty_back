process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let mongoose = require('mongoose');

let server = require('../API/app');

// require les shemas qu'on a besoin pour la route
let User = require('../API/database/methods/user');
let Place = require('../API/database/methods/place');
let Review = require('../API/database/methods/review');
let Media = require('../API/database/methods/media');
let Preference = require('../API/database/methods/preference');

let should = chai.should();
chai.use(chaiHttp);

before(function(done) {
  setTimeout(function() {
    done();
  }, 10); // Connect to the db before (only visual)
});

// Constants
const PINTY_ID = '5a17b219d057dcd085f6f03e';
const PINTY_KEY = 'a1e7cd8875292f3c2ef43e7fc16f72af';
const PINTY_KEY2 = 'a1e7cd8875292f3c2ef43e7fc16f71af';

const PINTY_ID2 = '5a17b219d057dcd185f6f03e';

const PLACE_ID = '5a6654131df38516955247eb';
const PLACE_ID2 = '5a6654131df38516955217eb';
const REVIEW_ID1 = '5a7d2271377fb017725bbd20';
const REVIEW_ID2 = '5a7d238bb2cdf0185942d43f';

describe('User', function() {
  // BeforeEach add doc db

  beforeEach(function(done) {
    var newPreference = new Preference({
      userID: PINTY_ID,
      type: {
        restaurant: 3,
        bar: 3,
      },
    });
    newPreference.save(done);
  });

  beforeEach(function(done) {
    var newUser = new User({
      _id: PINTY_ID,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      id: '1626560424072646',
      userName: 'jeanmichdu06',
      firstName: 'Ahmed',
      lastName: 'Thouch',
      image: 'https://i.imgur.com/ZDsiMmi.jpg',
      gender: 'male',
      birthDay: new Date(1464194866106),
      email: 'jean.michel@gmail.com',
      city: 'Paris',
      description: 'michmich',
      accessToken: 'hihihi',
      userAPIKey: PINTY_KEY,
      accessType: 'facebook',
      subPlaces: [PLACE_ID, PLACE_ID2],
      groups: [],
      friends: [PINTY_ID2, PINTY_ID],
      userPreference: PINTY_ID,
      pendingReview: ['5a6654131df38516955247eb', '5a6654131df38516955217eb'],
      role: 'USER',
      adminOf: [PLACE_ID],
      __v: 0,
    });
    newUser.save(function(err) {
      done();
    });
  });

  beforeEach(function(done) {
    var newUser = new User({
      _id: PINTY_ID2,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      id: '1626560424072645',
      userName: 'Kim-chung',
      firstName: 'Kim',
      lastName: 'KimBi',
      image: 'https://i.imgur.com/ZDsiMmi.jpg',
      gender: 'male',
      birthDay: new Date(1464194866105),
      email: 'jean.michel@gmail.com',
      city: 'Paris',
      description: 'michmich',
      accessToken: 'hihihi',
      userAPIKey: PINTY_KEY2,
      accessType: 'facebook',
      subPlaces: [],
      groups: [],
      friends: [],
      pendingReview: ['5a6654131df38516955247eb', '5a6654131df38516955217eb'],
      role: 'USER',
      adminOf: [PLACE_ID],
      __v: 0,
    });
    newUser.save(function(err) {
      done();
    });
  });

  beforeEach(function(done) {
    var newPlace = new Place({
      _id: PLACE_ID2,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      placeID: 'ChIJK8aamnMx3YAR4TF1G_SGG5E',
      name: 'East Anaheim Street',
      formattedAddress: '2142 East Anaheim Street, Cambodia Town, Los Angeles County',
      location: [33.782242, -118.1659501],
      phone: '(562) 930-0639',
      priceLevel: 3,
      rating: 3.6,
      googleRating: 4.8,
      url: 'https://maps.google.com/?cid=10456099342861545953',
      website: 'http://www.baguetteparis.com/',
      image: 'https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png',
      lastRequest: Date.now(),
      types: 'hotel',
      image:
        'https://lh3.googleusercontent.com/p/AF1QipMZBeGicsMgRm38OHKt_6bqv_5I9ZxDZDncyL2c=s1600-w400-h400',
      openingHours: [],
      subs: [],
      __v: 0,
    });
    newPlace.save(done);
  });

  beforeEach(function(done) {
    var newPlace = new Place({
      _id: PLACE_ID,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      placeID: 'ChIJq6qq6jauEmsR46KYci7M5Jc',
      name: 'Astral Tower & Residences - The Star',
      formattedAddress: '48 Pirrama Rd, Pyrmont NSW 2009, Australia',
      location: [151.1947409, -33.8675557],
      phone: '(02) 9374 4000',
      priceLevel: 2,
      rating: 3.5,
      googleRating: 4.4,
      url: 'https://maps.google.com/?cid=10281119596374313554',
      website: 'https://www.google.com.au/about/careers/locations/sydney/',
      image: 'https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png',
      lastRequest: Date.now(),
      types: 'hotel',
      image:
        'https://lh3.googleusercontent.com/p/AF1QipMZBeGicsMgRm38OHKt_6bqv_5I9ZxDZDncyL2c=s1600-w400-h400',
      openingHours: [],
      subs: [],
      __v: 0,
    });
    newPlace.save(done);
  });

  beforeEach(function(done) {
    var newReview1 = new Review({
      _id: REVIEW_ID1,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      authorID: PINTY_ID,
      placeID: PLACE_ID,
      type: 'pinty',
      rating: 4.5,
      message: 'So cooooooool',
      __v: 0,
    });

    var newReview2 = new Review({
      _id: REVIEW_ID2,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      authorID: PINTY_ID,
      placeID: PLACE_ID,
      type: 'pinty',
      rating: 1.5,
      message: 'So baaaaaaaaad',
      __v: 0,
    });
    newReview1.save(err => {
      newReview2.save(done);
    });
  });

  beforeEach(function(done) {
    var newMedia = new Media({
      _id: PINTY_ID,
      filePath:
        'http://pinty.en-f.eu/api-dev/public/media/review/5ae1774fe65b690ee8a64a64/2188f73e.gif',
      authorID: PINTY_ID,
      reviewID: REVIEW_ID1,
      type: 'image/gif',
      height: 68,
      width: 61,
      size: 1.9515,
    });
    newMedia.save(done);
  });

  describe('GET /user', function() {
    it('should return user public informations on GET /user/id/:id/profile', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/profile`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('id');
          res.body.data.id.should.be.a('string');
          res.body.data.id.should.equal(PINTY_ID);

          res.body.data.should.have.property('username');
          res.body.data.username.should.be.a('string');
          res.body.data.username.should.equal('jeanmichdu06');

          res.body.data.should.have.property('firstname');
          res.body.data.firstname.should.be.a('string');
          res.body.data.firstname.should.equal('Ahmed');

          res.body.data.should.have.property('lastname');
          res.body.data.lastname.should.be.a('string');
          res.body.data.lastname.should.equal('Thouch');

          res.body.data.should.have.property('city');
          res.body.data.city.should.be.a('string');
          res.body.data.city.should.equal('Paris');

          res.body.data.should.have.property('description');
          res.body.data.description.should.be.a('string');
          res.body.data.description.should.equal('michmich');

          res.body.data.should.have.property('image');
          res.body.data.image.should.be.a('string');
          res.body.data.image.should.equal('https://i.imgur.com/ZDsiMmi.jpg');

          res.body.data.should.have.property('role');
          res.body.data.role.should.be.a('string');
          res.body.data.role.should.equal('USER');
          done();
        });
    });

    it('should not be allowed to get user public informations pinty id is missing  on GET /user/id/:id/profile', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/profile`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          done();
        });
    });

    it('should not be allowed to get user public informations pinty key is missing  on GET /user/id/:id/profile', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/profile`)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          done();
        });
    });

    it('should return user public informations on GET /user/id/:id/profile/public', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/profile`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('id');
          res.body.data.id.should.be.a('string');
          res.body.data.id.should.equal(PINTY_ID);

          res.body.data.should.have.property('username');
          res.body.data.username.should.be.a('string');
          res.body.data.username.should.equal('jeanmichdu06');

          res.body.data.should.have.property('firstname');
          res.body.data.firstname.should.be.a('string');
          res.body.data.firstname.should.equal('Ahmed');

          res.body.data.should.have.property('lastname');
          res.body.data.lastname.should.be.a('string');
          res.body.data.lastname.should.equal('Thouch');

          res.body.data.should.have.property('city');
          res.body.data.city.should.be.a('string');
          res.body.data.city.should.equal('Paris');

          res.body.data.should.have.property('description');
          res.body.data.description.should.be.a('string');
          res.body.data.description.should.equal('michmich');

          res.body.data.should.have.property('image');
          res.body.data.image.should.be.a('string');
          res.body.data.image.should.equal('https://i.imgur.com/ZDsiMmi.jpg');

          res.body.data.should.have.property('role');
          res.body.data.role.should.be.a('string');
          res.body.data.role.should.equal('USER');

          res.body.data.should.have.property('gender');
          res.body.data.gender.should.be.a('string');
          res.body.data.gender.should.equal('male');

          res.body.data.should.have.property('birthday');
          res.body.data.birthday.should.be.a('number');
          res.body.data.birthday.should.equal(1464194866106);

          res.body.data.should.have.property('email');
          res.body.data.email.should.be.a('string');
          res.body.data.email.should.equal('jean.michel@gmail.com');

          res.body.data.should.have.property('accessType');
          res.body.data.accessType.should.be.a('string');
          res.body.data.accessType.should.equal('facebook');
          done();
        });
    });

    it('should not be allowed to return user public informations pinty id is missing on GET /user/id/:id/profile/public', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/profile`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });

    it('should not be allowed to return user public informations  pinty key is missing on GET /user/id/:id/profile/public', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/profile`)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });

    it('should list reviews by user ID on GET /user/id/:id/reviews/limit/10', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/reviews/limit/10`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('results');
          res.body.data.results.should.be.a('array');

          res.body.data.results.should.have.lengthOf.within(1, 10);

          res.body.data.results[0].should.have.property('id');

          res.body.data.results[0].should.have.property('type');
          res.body.data.results[0].type.should.be.a('string');

          res.body.data.results[0].should.have.property('author');
          res.body.data.results[0].author.should.be.a('object');

          res.body.data.results[0].author.should.have.property('id');

          res.body.data.results[0].author.should.have.property('name');
          res.body.data.results[0].author.name.should.be.a('string');

          res.body.data.results[0].author.should.have.property('pp');
          res.body.data.results[0].author.pp.should.be.a('string');

          res.body.data.results[0].should.have.property('rating');
          res.body.data.results[0].rating.should.be.a('number');

          res.body.data.results[0].should.have.property('message');
          res.body.data.results[0].message.should.be.a('string');

          res.body.data.results[0].should.have.property('medias');
          res.body.data.results[0].medias.should.be.a('Array');

          if (res.body.data.results[0].medias.length > 0) {
            res.body.data.results[0].medias[0].should.have.property('id');
            res.body.data.results[0].medias[0].id.should.be.a('string');

            res.body.data.results[0].medias[0].should.have.property('url');
            res.body.data.results[0].medias[0].url.should.be.a('string');

            res.body.data.results[0].medias[0].should.have.property('metadata');
            res.body.data.results[0].medias[0].metadata.should.be.a('Object');

            res.body.data.results[0].medias[0].metadata.should.have.property('type');
            res.body.data.results[0].medias[0].metadata.type.should.be.a('string');

            res.body.data.results[0].medias[0].metadata.should.have.property('height');
            res.body.data.results[0].medias[0].metadata.height.should.be.a('number');

            res.body.data.results[0].medias[0].metadata.should.have.property('width');
            res.body.data.results[0].medias[0].metadata.width.should.be.a('number');

            res.body.data.results[0].medias[0].metadata.should.have.property('size');
            res.body.data.results[0].medias[0].metadata.size.should.be.a('number');
          }

          res.body.data.results[0].should.have.property('created');
          res.body.data.results[0].created.should.be.a('number');

          res.body.data.results[0].should.have.property('place');
          res.body.data.results[0].place.should.be.a('object');

          done();
        });
    });

    it('should not list reviews by user ID pinty id is missing on GET /user/id/:id/reviews/limit/10', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/reviews/limit/10`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');

          done();
        });
    });
  });

  describe('PATCH /user', function() {
    it('should edit and list user profile on PATCH /user/id/:id/profile/edit', done => {
      chai
        .request(server)
        .patch(`/user/id/${PINTY_ID}/profile/edit`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          username: 'username1',
          firstname: 'firstname1',
          lastname: 'lastname2',
          gender: 'female',
          birthday: '1517560407939',
          email: 'jeanmi@gmail.com',
          image:
            'data:image/gif;base64,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',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('id');
          res.body.data.id.should.be.a('string');
          res.body.data.id.should.equal(PINTY_ID);

          res.body.data.should.have.property('username');
          res.body.data.username.should.be.a('string');
          res.body.data.username.should.equal('username1');

          res.body.data.should.have.property('firstname');
          res.body.data.firstname.should.be.a('string');
          res.body.data.firstname.should.equal('firstname1');

          res.body.data.should.have.property('lastname');
          res.body.data.lastname.should.be.a('string');
          res.body.data.lastname.should.equal('lastname2');

          res.body.data.should.have.property('city');
          res.body.data.city.should.be.a('string');
          res.body.data.city.should.equal('Paris');

          res.body.data.should.have.property('description');
          res.body.data.description.should.be.a('string');
          res.body.data.description.should.equal('michmich');

          res.body.data.should.have.property('image');
          res.body.data.image.should.be.a('string');
          res.body.data.image.should.equal(
            'http://pinty.en-f.eu/api-test/public/media/profile/5a17b219d057dcd085f6f03e.gif',
          );

          res.body.data.should.have.property('role');
          res.body.data.role.should.be.a('string');
          res.body.data.role.should.equal('USER');

          res.body.data.should.have.property('gender');
          res.body.data.gender.should.be.a('string');
          res.body.data.gender.should.equal('female');

          res.body.data.should.have.property('birthday');
          res.body.data.birthday.should.be.a('number');
          res.body.data.birthday.should.equal(1517560407939);

          res.body.data.should.have.property('email');
          res.body.data.email.should.be.a('string');
          res.body.data.email.should.equal('jeanmi@gmail.com');

          res.body.data.should.have.property('accessType');
          res.body.data.accessType.should.be.a('string');
          res.body.data.accessType.should.equal('facebook');
          done();
        });
    });

    it('should not be allowed to edit and list user profile pinty id is missing on PATCH /user/id/:id/profile/edit', done => {
      chai
        .request(server)
        .patch(`/user/id/${PINTY_ID}/profile/edit`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });

    it('should not be allowed to edit and list user profile pinty  key is missing on PATCH /user/id/:id/profile/edit', done => {
      chai
        .request(server)
        .patch(`/user/id/${PINTY_ID}/profile/edit`)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });
  });

  describe('PUT /user', function() {
    it('should add friend on PUT /user/id/:id/friend/add/:friendID', done => {
      chai
        .request(server)
        .put(`/user/id/${PINTY_ID}/friend/add/${PINTY_ID}`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.equal(true);
          done();
        });
    });

    it('should not be allowed to add friend pinty key is missing on PUT /user/id/:id/friend/add/:friendID', done => {
      chai
        .request(server)
        .put(`/user/id/${PINTY_ID}/friend/add/${PINTY_ID}`)
        .set('pinty_id', PINTY_ID)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });

    it('should subscribe to a place on PUT /user/id/:id/sub/place/add/:placeID', done => {
      chai
        .request(server)
        .put(`/user/id/${PINTY_ID}/sub/place/add/${PLACE_ID}`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.equal(true);
          done();
        });
    });

    it('should not be allowed to subscribe to a place pinty key is missing on PUT /user/id/:id/sub/place/add/:placeID', done => {
      chai
        .request(server)
        .put(`/user/id/${PINTY_ID}/sub/place/add/${PLACE_ID}`)
        .set('pinty_id', PINTY_ID)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });
  });

  describe('GET /user', function() {
    it('should return list of  user subPlaces  on GET /user/id/:id/sub/place/list', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/sub/place/list`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.results[0].should.have.property('id');
          res.body.data.results[0].id.should.be.a('string');
          res.body.data.results[0].should.have.property('name');
          res.body.data.results[0].name.should.be.a('string');

          done();
        });
    });
  });

  describe('GET /user', function() {
    it('should return list of  user friends on GET /user/id/:id/friend/list', done => {
      chai
        .request(server)
        .get(`/user/id/${PINTY_ID}/friend/list`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.results[0].should.have.property('id');
          res.body.data.results[0].id.should.be.a('string');
          res.body.data.results[0].should.have.property('name');
          res.body.data.results[0].name.should.be.a('string');
          res.body.data.results[0].should.have.property('image');
          res.body.data.results[0].image.should.be.a('string'); //TODO add failing tests
          done();
        });
    });
  });

  describe('DELETE /user', function() {
    it('should delete a place on delete /user/id/:id/sub/place/add/:placeID', done => {
      chai
        .request(server)
        .delete(`/user/id/${PINTY_ID}/friend/delete/${PLACE_ID}`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.equal(true);
          done();
        });
    });

    it('should not be allowed to delete a place pinty key is missing on PUT /user/id/:id/sub/place/add/:placeID', done => {
      chai
        .request(server)
        .delete(`/user/id/${PINTY_ID}/friend/delete/${PLACE_ID}`)
        .set('pinty_id', PINTY_ID)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });

    it('should delete friend on DELETE /user/id/:id/friend/add/:friendID', done => {
      chai
        .request(server)
        .delete(`/user/id/${PINTY_ID}/friend/delete/${PINTY_ID}`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.equal(true);
          done();
        });
    });

    it('should not be allowed to add friend pinty key is missing on DELETE /user/id/:id/friend/add/:friendID', done => {
      chai
        .request(server)
        .delete(`/user/id/${PINTY_ID}/friend/delete/${PINTY_ID}`)
        .set('pinty_id', PINTY_ID)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });
  });

  // afterEach drop tables added doc
  afterEach(function(done) {
    User.collection.drop();
    Place.collection.drop();
    Media.collection.drop();
    Review.collection.drop();
    Preference.collection.drop();
    done();
  });
});
