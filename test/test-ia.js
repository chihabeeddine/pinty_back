process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let mongoose = require('mongoose');

let server = require('../API/app');

// require les shemas qu'on a besoin pour la route
let User = require('../API/database/methods/user');
let Place = require('../API/database/methods/place');
let Review = require('../API/database/methods/review');
let IASuggestion = require('../API/database/methods/iasuggestion');
let Preference = require('../API/database/methods/preference');

let should = chai.should();
chai.use(chaiHttp);

before(function (done) {
  setTimeout(function () {
    done();
  }, 10); // Connect to the db before (only visual)
});

// Constants
const PINTY_ID = '5a17b219d057dcd085f6f03e';
const PINTY_ID2 = '5a17b219d057dcd085f6f04e';
const PINTY_KEY = 'a1e7cd8875292f3c2ef43e7fc16f72af';

const PLACE_ID = '5a6654131df38516955247eb';
const PLACE_ID2 = '5a6654131df38516955217eb';
const REVIEW_ID1 = '5a7d2271377fb017725bbd20';
const REVIEW_ID2 = '5a7d238bb2cdf0185942d43f';
const IASUGGESTION_ID = '5a7d2271377fb017725bbd30';
const IASUGGESTION_ID2 = '5a7d2271377fb017725bbd21';

const PREF_UPDATE = {
  administratif: 2,
  autre: 2,
  bar: 3,
  culture: 3,
  divertissement: 3,
  hotel: 3,
  magasin: 2,
  naturel: 3,
  restaurant: 3,
  transport: 2,
  service: 2
};

describe('IA', function () {
  // BeforeEach add doc db
  beforeEach(function (done) {
    var newPreference = new Preference({
      userID: PINTY_ID,
      type: {
        administratif: 1,
        autre: 1,
        bar: 3,
        culture: 1,
        divertissement: 1,
        hotel: 3,
        magasin: 1,
        naturel: 1,
        restaurant: 3,
        transport: 1,
        service: 1
      },
    });
    newPreference.save(done);
  });

  beforeEach(function (done) {
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
      accessTokenRefresh: null,
      image: 'http://pinty.en-f.eu/api-test/public/media/profile/5a6654131df38516955247eb.gif',
      email: 'jean.michel@gmail.com',
      city: 'Paris',
      description: 'michmich',
      userAPIKey: PINTY_KEY,
      accessType: 'facebook',
      subPlaces: [PLACE_ID],
      groups: [],
      friends: [],
      userPreference: '5a17b219d057dcd085f6f03e',
      pendingReview: ['5a6654131df38516955247eb', '5a6654131df38516955217eb'],
      role: 'USER',
      adminOf: [PLACE_ID],
      __v: 0,
    });
    newUser.save(done);
  });

  beforeEach(function (done) {
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
      image: 'https://lh3.googleusercontent.com/p/AF1QipMZBeGicsMgRm38OHKt_6bqv_5I9ZxDZDncyL2c=s1600-w400-h400',
      subs: [],
      openingHours: null,
      __v: 0,
    });
    newPlace.save(done);
  });

  beforeEach(function (done) {
    var newIASuggestion = new IASuggestion({
      _id: IASUGGESTION_ID,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      placeID: PLACE_ID,
      userID: PINTY_ID,
      type: 'bar',
      note: 2,
      __v: 0,
    });
    newIASuggestion.save(done);
  });
  beforeEach(function (done) {
    var newIASuggestionN = new IASuggestion({
      _id: IASUGGESTION_ID2,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      placeID: '5ba16bedcfd4675dbf47f8f9',
      userID: PINTY_ID,
      googlePlaceID: 'ChIJm7Ex8UmuEmsR37p4Hm0D0VI',
      type: 'bar',
      note: 4,
      __v: 0,
    });
    newIASuggestionN.save(done);
  });

  beforeEach(function (done) {
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

  /*longitude: '151.1957362',
                    latitude: '-33.8670522',*/
  describe('POST /ia', function () {
    it('should  return a place suggestion for a user on POST /ia/suggestion/:id/', done => {
      chai
        .request(server)
        .post(`/ia/suggestion/${PINTY_ID}`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          longitude: '2.3627283',
          latitude: '48.8155516',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.results[0].should.have.property('id');
          res.body.data.results[0].id.should.be.a('string');

          res.body.data.results[0].should.have.property('suggestionID');
          res.body.data.results[0].suggestionID.should.be.a('string');

          res.body.data.results[0].should.have.property('name');
          res.body.data.results[0].name.should.be.a('string');

          res.body.data.results[0].should.have.property('rating');
          res.body.data.results[0].rating.should.be.a('number');

          res.body.data.results[0].should.have.property('type');
          res.body.data.results[0].type.should.be.a('string');

          res.body.data.results[0].should.have.property('compatibility');
          res.body.data.results[0].compatibility.should.be.a('number');

          res.body.data.results[0].should.have.property('image');
          done();
        });
    });

    it('should not return a place suggestion for a user POST pinty_id is messing /ia/suggestion/:id/', done => {
      chai
        .request(server)
        .post(`/ia/suggestion/${PINTY_ID}`)
        .set('pinty_key', PINTY_KEY)
        .send({
          longitude: '151.1957362',
          latitude: '-33.8670522',
          radius: '500',
          type: 'bar',
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });
  });

  describe('PATCH /ia', function () {
    it('should note a suggestion on PATCH /ia/suggestion/:id/note/', done => {
      chai
        .request(server)
        .patch(`/ia/suggestion/${IASUGGESTION_ID}/note/`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          userID: PINTY_ID,
          note: 2,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.equal(true);
          done();
        });
    });

    it('should not note a suggestion PATCH /ia/suggestion/:id/note/ - pinty id is missing', done => {
      chai
        .request(server)
        .patch(`/ia/suggestion/${IASUGGESTION_ID}/note/`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');

          done();
        });
    });
  });

  describe('POST /form', function () {
    it('update user preference on POST /ia/form/:id/', done => {
      chai
        .request(server)
        .post(`/ia/form/${PINTY_ID}`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          longitude: '2.3627283',
          latitude: '48.8155516',
          pref: PREF_UPDATE
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          done();
        });
    });
  });

  // afterEach drop tables added doc
  afterEach(function (done) {
    User.collection.drop();
    Place.collection.drop();
    Review.collection.drop();
    IASuggestion.collection.drop();
    Preference.collection.drop();
    done();
  });
});