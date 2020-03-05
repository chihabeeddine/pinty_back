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

before(function (done) {
  setTimeout(function () {
    done();
  }, 10); // Connect to the db before (only visual)
});

// Constants
const PINTY_ID = '5a17b219d057dcd085f6f03e';
const PINTY_KEY = 'a1e7cd8875292f3c2ef43e7fc16f72af';

const PLACE_ID = '5a6654131df38516955247eb';
const REVIEW_ID1 = '5a7d2271377fb017725bbd20';
const REVIEW_ID2 = '5a7d238bb2cdf0185942d43f';

const PAGE_TOKEN =
  'CpQCAgEAAFxg8o-eU7_uKn7Yqjana-HQIx1hr5BrT4zBaEko29ANsXtp9mrqN0yrKWhf-y2PUpHRLQb1GT-mtxNcXou8TwkXhi1Jbk-ReY7oulyuvKSQrw1lgJElggGlo0d6indiH1U-tDwquw4tU_UXoQ_sj8OBo8XBUuWjuuFShqmLMP-0W59Vr6CaXdLrF8M3wFR4dUUhSf5UC4QCLaOMVP92lyh0OdtF_m_9Dt7lz-Wniod9zDrHeDsz_by570K3jL1VuDKTl_U1cJ0mzz_zDHGfOUf7VU1kVIs1WnM9SGvnm8YZURLTtMLMWx8-doGUE56Af_VfKjGDYW361OOIj9GmkyCFtaoCmTMIr5kgyeUSnB-IEhDlzujVrV6O9Mt7N4DagR6RGhT3g1viYLS4kO5YindU6dm3GIof1Q';
describe('Search', function () {
  // BeforeEach add doc db

  beforeEach(function (done) {
    var newUser = new User({
      _id: PINTY_ID,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      id: '1626560424072646',
      userName: 'masterbender',
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
      subPlaces: [],
      groups: [],
      friends: [],
      pendingReview: ['5a6654131df38516955247eb', '5a6654131df38516955217eb'],
      role: 'USER',
      adminOf: [PLACE_ID],
      __v: 0,
    });
    newUser.save(function (err) {
      done();
    });
  });

  describe('POST /search/places', function () {
    it('should list places that matches the research on POST /search/places', done => {
      chai
        .request(server)
        .post('/search/places')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          query: 'Astral Tower',
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

          /*res.body.data.results[1].should.have.property('googleRating');
                    res.body.data.results[1].googleRating.should.be.a('number');*/

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

    it('should not list places that matches the research on POST /search/places query missing', done => {
      chai
        .request(server)
        .post('/search/places')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          done();
        });
    });

    it('should not list places that matches the research on POST /search/places pinty id missing', done => {
      chai
        .request(server)
        .post('/search/places')
        .set('pinty_key', PINTY_KEY)
        .send({
          query: 'Astral Tower',
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          done();
        });
    });

    it('should list places that matches the research on POST /search/places', done => {
      chai
        .request(server)
        .post(`/search/places/${PAGE_TOKEN}`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          query: 'Biaggio Cafe - Pyrmont',
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

          /*res.body.data.results[1].should.have.property('googleRating');
                    res.body.data.results[1].googleRating.should.be.a('number');*/

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

    it('should not list places that matches the research on POST /search/places query missing', done => {
      chai
        .request(server)
        .post(`/search/places/${PAGE_TOKEN}`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          done();
        });
    });

    it('should not list places that matches the research on POST /search/places pinty id missing', done => {
      chai
        .request(server)
        .post(`/search/places/${PAGE_TOKEN}`)
        .set('pinty_key', PINTY_KEY)
        .send({
          query: 'Biaggio Cafe - Pyrmont',
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          done();
        });
    });
  });

  describe('POST /search/users', function () {
    it('should return a user that matches the research on POST /search/users', done => {
      chai
        .request(server)
        .post('/search/users')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          query: 'Ahmed',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.be.a('object');

          res.body.data.results[0].should.have.property('id');
          res.body.data.results[0].id.should.be.a('string');
          res.body.data.results[0].id.should.equal('5a17b219d057dcd085f6f03e');

          res.body.data.results[0].should.have.property('username');
          res.body.data.results[0].username.should.be.a('string');
          res.body.data.results[0].username.should.equal('masterbender');

          res.body.data.results[0].should.have.property('firstname');
          res.body.data.results[0].firstname.should.be.a('string');
          res.body.data.results[0].firstname.should.equal('Ahmed');

          res.body.data.results[0].should.have.property('lastname');
          res.body.data.results[0].lastname.should.be.a('string');
          res.body.data.results[0].lastname.should.equal('Thouch');

          res.body.data.results[0].should.have.property('image');
          res.body.data.results[0].image.should.be.a('string');
          res.body.data.results[0].image.should.equal('https://i.imgur.com/ZDsiMmi.jpg');

          res.body.data.results[0].should.have.property('role');
          res.body.data.results[0].role.should.be.a('string');
          res.body.data.results[0].role.should.equal('USER');

          done();
        });
    });

    it('should not return a user because pinty_key is missing on POST /search/users', done => {
      chai
        .request(server)
        .post('/search/users')
        .set('pinty_id', PINTY_ID)
        .send({
          query: 'Ahmed',
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          done();
        });
    });
  });

  // afterEach drop tables added doc
  afterEach(function (done) {
    User.collection.drop();
    done();
  });
});