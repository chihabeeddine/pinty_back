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
const REVIEW_ID1 = '5a7d2271377fb017725bbd20';
const REVIEW_ID2 = '5a7d238bb2cdf0185942d43f';

describe('Place', function() {
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
      pendingReview: ['5a6654131df38516955247eb', '5a6654131df38516955217eb'],
      role: 'USER',
      adminOf: [PLACE_ID],
      __v: 0,
    });
    newUser.save(done);
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
      image: 'https://i.imgur.com/ZDsiMmi.jpg',
      phone: '(02) 9374 4000',
      priceLevel: 2,
      rating: 3.5,
      googleRating: 4.4,
      url: 'https://maps.google.com/?cid=10281119596374313554',
      website: 'https://www.google.com.au/about/careers/locations/sydney/',
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
      placeID: PLACE_ID,
      type: 'image/gif',
      height: 68,
      width: 61,
      size: 1.9515,
    });
    newMedia.save(done);
  });

  describe('GET /place', function() {
    it('should not list place informations pinty id is missing on GET /place/id/:id/info', done => {
      chai
        .request(server)
        .get(`/place/id/${PLACE_ID}/info`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });
    it('should list place informations on GET /place/id/:id/info', done => {
      chai
        .request(server)
        .get(`/place/id/${PLACE_ID}/info`)
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

          res.body.data.should.have.property('placeID');
          res.body.data.placeID.should.be.a('string');

          res.body.data.should.have.property('name');
          res.body.data.name.should.be.a('string');

          res.body.data.should.have.property('formattedAddress');
          res.body.data.formattedAddress.should.be.a('string');

          res.body.data.should.have.property('location');
          res.body.data.location.should.be.a('array');

          res.body.data.should.have.property('openingHours');
          res.body.data.openingHours.should.be.a('array');

          res.body.data.should.have.property('phone');
          res.body.data.phone.should.be.a('string');

          res.body.data.should.have.property('priceLevel');
          res.body.data.priceLevel.should.be.a('number');

          res.body.data.should.have.property('rating');
          res.body.data.rating.should.be.a('number');

          res.body.data.should.have.property('googleRating');
          res.body.data.googleRating.should.be.a('number');

          res.body.data.should.have.property('types');
          res.body.data.types.should.be.a('string');

          res.body.data.should.have.property('url');
          res.body.data.url.should.be.a('string');

          res.body.data.should.have.property('website');
          res.body.data.website.should.be.a('string');

          res.body.data.should.have.property('lastRequest');
          res.body.data.lastRequest.should.be.a('number');

          res.body.data.should.have.property('friends');
          res.body.data.friends.should.be.a('array');

          res.body.data.should.have.property('compatibility');
          res.body.data.compatibility.should.be.a('number');

          res.body.data.should.have.property('subs');
          res.body.data.subs.should.be.a('array');

          res.body.data.should.have.property('image');

          done();
        });
    });

    it('should not list reviews by place ID pinty id is missing on GET /place/id/:id/reviews/limit/10', done => {
      chai
        .request(server)
        .get(`/place/id/${PLACE_ID}/reviews/limit/10`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');

          done();
        });
    });

    it('should list reviews by place ID on GET /place/id/:id/reviews/limit/10', done => {
      chai
        .request(server)
        .get(`/place/id/${PLACE_ID}/reviews/limit/10`)
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

          res.body.data.results[0].should.have.property('place');
          res.body.data.results[0].place.should.be.a('object');

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

          done();
        });
    });

    it('should not list medias by place ID pinty id is missing on GET /place/id/:id/medias/limit/10', done => {
      chai
        .request(server)
        .get(`/place/id/${PLACE_ID}/medias/limit/10`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');

          done();
        });
    });

    it('should list medias by place ID on GET /place/id/:id/medias/limit/10', done => {
      chai
        .request(server)
        .get(`/place/id/${PLACE_ID}/medias/limit/10`)
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
          res.body.data.results.should.have.lengthOf.within(0, 10);

          res.body.data.results[0].should.have.property('id');
          res.body.data.results[0].id.should.be.a('string');

          res.body.data.results[0].should.have.property('reviewID');
          res.body.data.results[0].reviewID.should.be.a('string');

          res.body.data.results[0].should.have.property('author');
          res.body.data.results[0].author.should.be.a('object');

          res.body.data.results[0].author.should.have.property('id');
          res.body.data.results[0].author.id.should.be.a('string');

          res.body.data.results[0].author.should.have.property('name');
          res.body.data.results[0].author.name.should.be.a('string');

          res.body.data.results[0].author.should.have.property('pp');
          res.body.data.results[0].author.pp.should.be.a('string');

          res.body.data.results[0].should.have.property('url');
          res.body.data.results[0].url.should.be.a('string');

          res.body.data.results[0].should.have.property('metadata');
          res.body.data.results[0].metadata.should.be.a('object');

          res.body.data.results[0].metadata.should.have.property('type');
          res.body.data.results[0].metadata.type.should.be.a('string');

          res.body.data.results[0].metadata.should.have.property('height');
          res.body.data.results[0].metadata.height.should.be.a('number');

          res.body.data.results[0].metadata.should.have.property('width');
          res.body.data.results[0].metadata.width.should.be.a('number');

          res.body.data.results[0].metadata.should.have.property('size');
          res.body.data.results[0].metadata.size.should.be.a('number');

          done();
        });
    });
  });

  describe('POST /place', function() {
    it('should list places around location on POST /place/around/list', done => {
      chai
        .request(server)
        .post('/place/around/list')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          longitude: '151.1957362',
          latitude: '-33.8670522',
          radius: '500',
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
          res.body.data.results[0].id.should.be.a('string');

          res.body.data.results[0].should.have.property('placeID');
          res.body.data.results[0].placeID.should.be.a('string');

          res.body.data.results[0].should.have.property('latitude');
          res.body.data.results[0].latitude.should.be.a('number');

          res.body.data.results[0].should.have.property('longitude');
          res.body.data.results[0].longitude.should.be.a('number');

          res.body.data.results[0].should.have.property('name');
          res.body.data.results[0].name.should.be.a('string');

          res.body.data.results[0].should.have.property('rating');
          res.body.data.results[0].rating.should.be.a('number');

          res.body.data.results[0].should.have.property('googleRating');
          res.body.data.results[0].googleRating.should.be.a('number');

          res.body.data.results[0].should.have.property('types');
          res.body.data.results[0].types.should.be.a('string');

          res.body.data.results[0].should.have.property('friends');
          res.body.data.results[0].friends.should.be.a('array');

          res.body.data.results[0].should.have.property('compatibility');
          res.body.data.results[0].compatibility.should.be.a('number');

          res.body.data.results[0].should.have.property('subs');
          res.body.data.results[0].subs.should.be.a('array');

          res.body.data.results[0].should.have.property('image');

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

    done();
  });
});
