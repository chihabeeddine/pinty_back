process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let mongoose = require('mongoose');

let server = require('../API/app');

// require les shemas qu'on a besoin pour la route
let User = require('../API/database/methods/user');
let Place = require('../API/database/methods/place');
let Review = require('../API/database/methods/review');
let Feedback = require('../API/database/methods/feedback');
let Media = require('../API/database/methods/media');

let should = chai.should();
chai.use(chaiHttp);

before(function(done) {
  setTimeout(function() {
    done();
  }, 10); // Connect to the db before (only visual)
});

// Constants
const PINTY_ID = '5a17b219d057dcd195f6f03e';
const PINTY_ID1 = '5a17b219d057dcd195f6f04e';
const PINTY_KEY = 'a1e7cd8875292f3c2ef43e7fc16f72af';

const PLACE_ID = '5a6654131df38516955247eb';
const REVIEW_ID = '5a7d2271377fb017725bbd20';
const REVIEW_ID1 = '5a7d2271377fb017725bbd20';

describe('Backoffice', function() {
  // BeforeEach add doc db
  beforeEach(function(done) {
    var newMedia = new Media({
      _id: PINTY_ID1,
      filePath:
        'http://pinty.en-f.eu/api-dev/public/media/review/5ae1774fe65b690ee8a64a64/2188f73e.gif',
      authorID: PINTY_ID1,
      reviewID: REVIEW_ID1,
      placeID: PLACE_ID,
      type: 'image/gif',
      height: 68,
      width: 61,
      size: 1.9515,
    });
    newMedia.save(done);
  });

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
      pendingReview: ['5a6654131df38516955247eb', '5a6654131df38516955217eb'],
      role: 'ADMIN',
      adminOf: [PLACE_ID],
      __v: 0,
    });
    newUser.save(done);
  });

  beforeEach(function(done) {
    var newFeedback = new Feedback({
      authorID: PINTY_ID,
      title: 'shitty',
      content: 'not entresting',
      media: '',
    });
    newFeedback.save(done);
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
      types: 'hotel',
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

  describe('GET /user/list', function() {
    it('should get a list of user on GET /backoffice/user/list', done => {
      chai
        .request(server)
        .get('/backoffice/user/list')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .query({
          query: {
            email: 'jean.michel@gmail.com',
            lastname: 'Thouch',
            firstname: 'Nico',
            id: PINTY_ID,
          },
        })
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
          res.body.data.results[0].should.have.property('userName');
          res.body.data.results[0].should.have.property('firstName');
          res.body.data.results[0].should.have.property('lastName');
          res.body.data.results[0].should.have.property('image');
          res.body.data.results[0].should.have.property('role');
          res.body.data.results[0].should.have.property('gender');
          res.body.data.results[0].should.have.property('email');
          res.body.data.results[0].should.have.property('city');
          res.body.data.results[0].should.have.property('description');
          res.body.data.results[0].should.have.property('subPlaces');
          res.body.data.results[0].should.have.property('friends');
          res.body.data.results[0].should.have.property('groups');
          res.body.data.results[0].should.have.property('pendingReview');

          done();
        });
    });
  });

  describe('GET /place/list', function() {
    it('should get a list of places on GET /backoffice/place/list', done => {
      chai
        .request(server)
        .get('/backoffice/place/list')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .query({
          query: {
            rating: '3.6',
            type: 'hotel',
            id: PLACE_ID,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;

          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('results');
          res.body.data.results.should.be.a('array');
          res.body.data.results.should.have.lengthOf.above(0);

          res.body.data.results[0].should.have.property('placeID');
          res.body.data.results[0].placeID.should.be.a('string');
          res.body.data.results[0].should.have.property('name');
          res.body.data.results[0].name.should.be.a('string');
          res.body.data.results[0].placeID.should.be.a('string');
          res.body.data.results[0].should.have.property('formattedAddress');
          res.body.data.results[0].formattedAddress.should.be.a('string');
          res.body.data.results[0].should.have.property('location');
          res.body.data.results[0].location.should.be.a('Array');
          res.body.data.results[0].should.have.property('image');
          res.body.data.results[0].image.should.be.a('string');
          res.body.data.results[0].should.have.property('openingHours');
          res.body.data.results[0].should.have.property('phone');
          res.body.data.results[0].phone.should.be.a('string');
          res.body.data.results[0].should.have.property('priceLevel');
          res.body.data.results[0].priceLevel.should.be.a('number');
          res.body.data.results[0].should.have.property('rating');
          res.body.data.results[0].rating.should.be.a('number');
          res.body.data.results[0].should.have.property('googleRating');
          res.body.data.results[0].googleRating.should.be.a('number');
          res.body.data.results[0].should.have.property('types');
          res.body.data.results[0].types.should.be.a('string');
          res.body.data.results[0].should.have.property('website');
          res.body.data.results[0].website.should.be.a('string');
          res.body.data.results[0].should.have.property('lastRequest');
          res.body.data.results[0].lastRequest.should.be.a('string');
          res.body.data.results[0].should.have.property('subs');
          res.body.data.results[0].subs.should.be.a('Array');
          done();
        });
    });
  });

  describe('GET /media/list', function() {
    it('should get a list of media on GET /backoffice/media/list', done => {
      chai
        .request(server)
        .get('/backoffice/media/list')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .query({
          query: {
            author: PINTY_ID1,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;

          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('results');
          res.body.data.results.should.be.a('array');
          res.body.data.results.should.have.lengthOf.above(0);

          res.body.data.results[0].should.have.property('updatedAt');
          res.body.data.results[0].updatedAt.should.be.a('number');
          res.body.data.results[0].should.have.property('createdAt');
          res.body.data.results[0].createdAt.should.be.a('number');
          res.body.data.results[0].should.have.property('authorID');
          res.body.data.results[0].authorID.should.be.a('string');
          res.body.data.results[0].should.have.property('filePath');
          res.body.data.results[0].filePath.should.be.a('string');
          res.body.data.results[0].should.have.property('reviewID');
          res.body.data.results[0].reviewID.should.be.a('string');
          res.body.data.results[0].should.have.property('placeID');
          res.body.data.results[0].placeID.should.be.a('string');
          res.body.data.results[0].should.have.property('type');
          res.body.data.results[0].type.should.be.a('string');
          res.body.data.results[0].should.have.property('height');
          res.body.data.results[0].height.should.be.a('number');
          res.body.data.results[0].should.have.property('width');
          res.body.data.results[0].width.should.be.a('number');
          res.body.data.results[0].should.have.property('size');
          res.body.data.results[0].size.should.be.a('number');

          done();
        });
    });
  });

  describe('GET /feedback/list', function() {
    it('should get a list of media on GET /backoffice/feedback/list', done => {
      chai
        .request(server)
        .get('/backoffice/feedback/list')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .query({
          query: {
            author: PINTY_ID,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;

          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('results');
          res.body.data.results.should.be.a('array');
          res.body.data.results.should.have.lengthOf.above(0);

          res.body.data.results[0].should.have.property('updatedAt');
          res.body.data.results[0].updatedAt.should.be.a('number');
          res.body.data.results[0].should.have.property('createdAt');
          res.body.data.results[0].createdAt.should.be.a('number');
          res.body.data.results[0].should.have.property('authorID');
          res.body.data.results[0].authorID.should.be.a('string');
          res.body.data.results[0].should.have.property('title');
          res.body.data.results[0].title.should.be.a('string');
          res.body.data.results[0].should.have.property('content');
          res.body.data.results[0].content.should.be.a('string');
          res.body.data.results[0].should.have.property('medias');
          res.body.data.results[0].medias.should.be.a('Array');

          done();
        });
    });
  });

  describe('GET /review/list', function() {
    it('should get a list of media on GET /backoffice/review/list', done => {
      chai
        .request(server)
        .get('/backoffice/review/list')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .query({
          query: {
            datestart: '1464194856106',
            dateend: '1464194866106',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;

          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.should.have.property('results');
          res.body.data.results.should.be.a('array');
          res.body.data.results.should.have.lengthOf.above(0);

          res.body.data.results[0].should.have.property('updatedAt');
          res.body.data.results[0].updatedAt.should.be.a('number');
          res.body.data.results[0].should.have.property('createdAt');
          res.body.data.results[0].createdAt.should.be.a('number');
          res.body.data.results[0].should.have.property('authorID');
          res.body.data.results[0].authorID.should.be.a('string');
          res.body.data.results[0].should.have.property('placeID');
          res.body.data.results[0].placeID.should.be.a('string');
          res.body.data.results[0].should.have.property('rating');
          res.body.data.results[0].rating.should.be.a('number');
          res.body.data.results[0].should.have.property('message');
          res.body.data.results[0].message.should.be.a('string');

          done();
        });
    });
  });

  // afterEach drop tables added doc
  afterEach(function(done) {
    User.collection.drop();
    Place.collection.drop();
    Review.collection.drop();
    Feedback.collection.drop();
    Media.collection.drop();
    done();
  });
});
