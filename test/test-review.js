process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let mongoose = require('mongoose');

let server = require('../API/app');

// require les shemas qu'on a besoin pour la route
let User = require('../API/database/methods/user');
let Place = require('../API/database/methods/place');
let Review = require('../API/database/methods/review');
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

const PLACE_ID = '5a6654131df38516955247eb';
const PLACE_ID2 = '5a6654131df38516955217eb';
const REVIEW_ID = '5a7d2271377fb017725bbd20';

describe('Review', function() {
  // BeforeEach add doc db

  beforeEach(function(done) {
    var newUser = new User({
      _id: PINTY_ID,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      id: '1626560424072646',
      userName: null,
      firstName: 'Nico',
      lastName: 'Thouch',
      gender: 'male',
      birthDay: null,
      accessToken: 'hihihi',
      image: 'http://pinty.en-f.eu/api-test/public/media/profile/5a6654131df38516955247eb.gif',
      email: 'jean.michel@gmail.com',
      city: 'Paris',
      description: 'michmich',
      userAPIKey: PINTY_KEY,
      accessType: 'facebook',
      subPlaces: [],
      groups: [],
      friends: [],
      /* "userPreference": ["5a17b219d057dcd085f6f03e"], */
      pendingReview: ['5a6654131df38516955247eb', '5a6654131df38516955217eb'],
      role: 'USER',
      adminOf: [PLACE_ID],
      __v: 0,
    });
    newUser.save(done);
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
      rating: 4.5,
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
      rating: 3.6,
      googleRating: 4.4,
      url: 'https://maps.google.com/?cid=10281119596374313554',
      website: 'https://www.google.com.au/about/careers/locations/sydney/',
      lastRequest: Date.now(),
      types: ['lodging', 'point_of_interest', 'establishment'],
      image:
        'https://lh3.googleusercontent.com/p/AF1QipMZBeGicsMgRm38OHKt_6bqv_5I9ZxDZDncyL2c=s1600-w400-h400',
      subs: [],
      openingHours: null,
      __v: 0,
    });
    newPlace.save(done);
  });

  beforeEach(function(done) {
    var newReview = new Review({
      _id: REVIEW_ID,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      authorID: PINTY_ID,
      placeID: PLACE_ID,
      type: 'pinty',
      rating: 4.5,
      message: 'So cooooooool',
      __v: 0,
    });
    newReview.save(done);
  });

  beforeEach(function(done) {
    var newPreference = new Preference({
      userID: PINTY_ID,
      type: {
        bar: 3.5,
        hotel: 2,
        restaurant: 3.3,
      },
    });
    newPreference.save(done);
  });

  describe('PUT /review', function() {
    it('should create a review on PUT /review/create', done => {
      chai
        .request(server)
        .put('/review/create')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          authorID: PINTY_ID,
          placeID: PLACE_ID,
          rating: 4.5,
          message: 'So cooooooool',
          medias: [
            'data:image/gif;base64,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',
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;

          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('id');
          res.body.data.id.should.be.a('string');

          res.body.data.should.have.property('type');
          res.body.data.type.should.be.a('string');

          res.body.data.should.have.property('authorID');
          res.body.data.authorID.should.be.a('string');
          res.body.data.authorID.should.be.equal(PINTY_ID);

          res.body.data.should.have.property('rating');
          res.body.data.rating.should.be.a('number');
          res.body.data.rating.should.be.equal(4.5);

          res.body.data.should.have.property('message');
          res.body.data.message.should.be.a('string');
          res.body.data.message.should.be.equal('So cooooooool');

          res.body.data.should.have.property('created');
          res.body.data.created.should.be.a('number');

          res.body.data.should.have.property('place');
          res.body.data.place.should.be.a('object');

          res.body.data.place.should.have.property('id');
          res.body.data.place.id.should.be.a('string');

          res.body.data.place.should.have.property('name');
          res.body.data.place.name.should.be.a('string');

          res.body.data.place.should.have.property('image');
          res.body.data.place.image.should.be.a('string');

          res.body.data.should.have.property('medias');
          res.body.data.medias.should.be.a('Array');

          res.body.data.medias[0].should.have.property('id');
          res.body.data.medias[0].id.should.be.a('string');

          res.body.data.medias[0].should.have.property('url');
          res.body.data.medias[0].url.should.be.a('string');

          res.body.data.medias[0].should.have.property('metadata');
          res.body.data.medias[0].metadata.should.be.a('Object');

          res.body.data.medias[0].metadata.should.have.property('type');
          res.body.data.medias[0].metadata.type.should.be.a('string');

          res.body.data.medias[0].metadata.should.have.property('height');
          res.body.data.medias[0].metadata.height.should.be.a('number');

          res.body.data.medias[0].metadata.should.have.property('width');
          res.body.data.medias[0].metadata.width.should.be.a('number');

          res.body.data.medias[0].metadata.should.have.property('size');
          res.body.data.medias[0].metadata.size.should.be.a('number');

          done();
        });
    });

    it('should not create a review pinty id is missing on PUT /review/create', done => {
      chai
        .request(server)
        .put('/review/create')
        .set('pinty_key', PINTY_KEY)
        .send({
          authorID: PINTY_ID,
          placeID: PLACE_ID,
          rating: 4.5,
          message: 'So cooooooool',
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');

          done();
        });
    });
  });

  describe('PATCH /review', function() {
    it('should edit and list user profile on PATCH /review/id/:id/review/edit', done => {
      chai
        .request(server)
        .patch(`/review/id/${REVIEW_ID}/review/edit`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          authorID: PINTY_ID,
          rating: 4.6,
          message: 'pizza 6k',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('id');
          res.body.data.id.should.be.a('string');

          res.body.data.should.have.property('authorID');
          res.body.data.authorID.should.be.a('string');

          res.body.data.should.have.property('rating');
          res.body.data.rating.should.be.a('number');

          res.body.data.should.have.property('message');
          res.body.data.message.should.be.a('string');

          res.body.data.should.have.property('place');
          res.body.data.place.should.be.a('object');

          res.body.data.place.should.have.property('id');
          res.body.data.place.id.should.be.a('string');

          res.body.data.place.should.have.property('name');
          res.body.data.place.name.should.be.a('string');

          res.body.data.place.should.have.property('image');
          res.body.data.place.image.should.be.a('string');

          res.body.data.should.have.property('created');
          res.body.data.created.should.be.a('number');

          res.body.data.should.have.property('place');
          res.body.data.place.should.be.a('object');

          done();
        });
    });
  });

  describe('PUT /pending', function() {
    it('should create a pending review on PUT /pending/:userID/add/:placeID', done => {
      chai
        .request(server)
        .put(`/review/pending/${PINTY_ID}/add/${PLACE_ID}`)
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

    it('should not create a pending review on PUT  pinty id is missing /pending/:userID/add/:placeID', done => {
      chai
        .request(server)
        .put(`/review/pending/${PINTY_ID}/add/${PLACE_ID}`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;

          done();
        });
    });
  });

  describe('GET /pending', function() {
    it('should get a pending review on GET /pending/:userID/list', done => {
      chai
        .request(server)
        .get(`/review/pending/${PINTY_ID}/list`)
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
          res.body.data.results.should.have.lengthOf.above(0);

          res.body.data.results[0].should.have.property('id');
          res.body.data.results[0].id.should.be.a('string');
          res.body.data.results[0].should.have.property('name');
          res.body.data.results[0].name.should.be.a('string');
          res.body.data.results[0].should.have.property('image');
          res.body.data.results[0].image.should.be.a('string');
          res.body.data.results[0].should.have.property('rating');
          res.body.data.results[0].rating.should.be.a('number');

          done();
        });
    });

    it('should not get a pending review on GET pinty id is missing /pending/:userID/list', done => {
      chai
        .request(server)
        .get(`/review/pending/${PINTY_ID}/list`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;

          done();
        });
    });
  });

  describe('DELETE /pending', function() {
    it('should delete a pending review on delete /:userID/delete/:placeID', done => {
      chai
        .request(server)
        .delete(`/review/pending/${PINTY_ID}/delete/${PLACE_ID}`)
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

    it('should not delete a pending review on delete pinty id is missing /:userID/delete/:placeID', done => {
      chai
        .request(server)
        .delete(`/review/pending/${PINTY_ID}/delete/${PLACE_ID}`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          done();
        });
    });
  });

  describe('DELETE /review', function() {
    it('should delete a review on delete /review/id/:id/delete', done => {
      chai
        .request(server)
        .delete(`/review/id/${REVIEW_ID}/delete`)
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

    it('should not delete a review on delete pinty id is missing /review/id/:id/delete', done => {
      chai
        .request(server)
        .delete(`/review/id/${REVIEW_ID}/delete`)
        .set('pinty_key', PINTY_KEY)
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
    Review.collection.drop();
    Preference.collection.drop();
    done();
  });
});
