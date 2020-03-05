process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let mongoose = require('mongoose');

let server = require('../API/app');

// require les shemas qu'on a besoin pour la route
let User = require('../API/database/methods/user');
let Place = require('../API/database/methods/place');
let Event = require('../API/database/methods/event');

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

//const EVENT_ID = '5a7d2271377fb017725bbd30';
const EVENT_ID = '5a7d2271377fb017725bbd40';

describe('Event', function () {
  // BeforeEach add doc db

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
      image: 'http://pinty.en-f.eu/api-test/public/media/profile/5a6654131df38516955247eb.gif',
      email: 'jean.michel@gmail.com',
      city: 'Paris',
      description: 'michmich',
      userAPIKey: PINTY_KEY,
      accessType: 'facebook',
      subPlaces: [PLACE_ID],
      groups: [],
      friends: [],
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
    var newEvent = new Event({
      _id: EVENT_ID,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      authorID: PINTY_ID,
      placeID: PLACE_ID,
      title: 'test event title',
      content: 'content test event',
      start: 1526277484192,
      end: 1529277484192,
      message: 'So cooooooool',
      medias: [
        'http://pinty.en-f.eu/api-dev/public/media/news/5ae1774fe65b690ee8a64a64/2188f73e.gif',
      ],
      __v: 0,
    });
    newEvent.save(done);
  });

  describe('GET /event/place/', function () {
    it('should get event by place ID on GET /event/place/:id/list', done => {
      chai
        .request(server)
        .get(`/event/place/${PLACE_ID}/list`)
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

          res.body.data.results[0].should.have.property('title');
          res.body.data.results[0].title.should.be.a('string');

          res.body.data.results[0].should.have.property('content');
          res.body.data.results[0].content.should.be.a('string');

          res.body.data.results[0].should.have.property('start');
          res.body.data.results[0].start.should.be.a('number');

          res.body.data.results[0].should.have.property('end');
          res.body.data.results[0].end.should.be.a('number');

          res.body.data.results[0].should.have.property('created');
          res.body.data.results[0].created.should.be.a('number');

          res.body.data.results[0].should.have.property('author');
          res.body.data.results[0].author.should.be.a('object');

          res.body.data.results[0].author.should.have.property('id');
          res.body.data.results[0].author.id.should.be.a('string');

          res.body.data.results[0].author.should.have.property('name');
          res.body.data.results[0].author.name.should.be.a('string');

          res.body.data.results[0].author.should.have.property('pp');
          res.body.data.results[0].author.pp.should.be.a('string');

          res.body.data.results[0].should.have.property('place');
          res.body.data.results[0].place.should.be.a('object');

          res.body.data.results[0].place.should.have.property('id');
          res.body.data.results[0].place.id.should.be.a('string');

          res.body.data.results[0].place.should.have.property('name');
          res.body.data.results[0].place.name.should.be.a('string');

          res.body.data.results[0].place.should.have.property('image');
          res.body.data.results[0].place.image.should.be.a('string');

          res.body.data.results[0].should.have.property('medias');
          res.body.data.results[0].medias.should.be.a('array');
          res.body.data.results[0].medias.should.have.lengthOf.above(0);

          done();
        });
    });

    it('should not get event by place ID on GET /event/place/:id/list - pinty id is missing', done => {
      chai
        .request(server)
        .get(`/event/place/${PLACE_ID}/list`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;

          done();
        });
    });
  });

  describe('GET /event/user/', function () {
    it('should get event by user ID (subscribed event) on GET /event/user/:id/list', done => {
      chai
        .request(server)
        .get(`/event/user/${PINTY_ID}/list`)
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

          res.body.data.results[0].should.have.property('title');
          res.body.data.results[0].title.should.be.a('string');

          res.body.data.results[0].should.have.property('content');
          res.body.data.results[0].content.should.be.a('string');

          res.body.data.results[0].should.have.property('created');
          res.body.data.results[0].created.should.be.a('number');

          res.body.data.results[0].should.have.property('author');
          res.body.data.results[0].author.should.be.a('object');

          res.body.data.results[0].author.should.have.property('id');
          res.body.data.results[0].author.id.should.be.a('string');

          res.body.data.results[0].author.should.have.property('name');
          res.body.data.results[0].author.name.should.be.a('string');

          res.body.data.results[0].author.should.have.property('pp');
          res.body.data.results[0].author.pp.should.be.a('string');

          res.body.data.results[0].should.have.property('place');
          res.body.data.results[0].place.should.be.a('object');

          res.body.data.results[0].place.should.have.property('id');
          res.body.data.results[0].place.id.should.be.a('string');

          res.body.data.results[0].place.should.have.property('name');
          res.body.data.results[0].place.name.should.be.a('string');

          res.body.data.results[0].place.should.have.property('image');
          res.body.data.results[0].place.image.should.be.a('string');

          res.body.data.results[0].should.have.property('medias');
          res.body.data.results[0].medias.should.be.a('array');
          res.body.data.results[0].medias.should.have.lengthOf.above(0);

          done();
        });
    });

    it('should not get event by user ID (subscribed event) on GET /event/user/:id/list - pinty id is missing', done => {
      chai
        .request(server)
        .get(`/event/user/${PINTY_ID}/list`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;

          done();
        });
    });
  });

  describe('PUT /event/create/', function () {
    it('should create a event on PUT /event/create/', done => {
      chai
        .request(server)
        .put('/event/create/')
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          authorID: PINTY_ID,
          placeID: PLACE_ID,
          title: 'Pinty restaurant',
          content: 'Pizza gratuite venez vite',
          start: 1526277484192,
          end: 1529277484192,
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

          res.body.data.should.have.property('authorID');
          res.body.data.authorID.should.be.a('string');
          res.body.data.authorID.should.be.equal(PINTY_ID);

          res.body.data.should.have.property('title');
          res.body.data.title.should.be.a('string');
          res.body.data.title.should.be.equal('Pinty restaurant');

          res.body.data.should.have.property('content');
          res.body.data.content.should.be.a('string');
          res.body.data.content.should.be.equal('Pizza gratuite venez vite');

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
          res.body.data.medias.should.be.a('array');
          res.body.data.medias.should.have.lengthOf.above(0);

          done();
        });
    });

    it('should not create a event on PUT /event/create/ - pinty id is missing', done => {
      chai
        .request(server)
        .put('/event/create/')
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');

          done();
        });
    });
  });

  describe('PATCH /event', function () {
    it('should edit and get a event on PATCH /event/id/:id/edit/', done => {
      chai
        .request(server)
        .patch(`/event/id/${EVENT_ID}/edit/`)
        .set('pinty_id', PINTY_ID)
        .set('pinty_key', PINTY_KEY)
        .send({
          authorID: PINTY_ID,
          placeID: PLACE_ID,
          title: 'Pinty restaurant 2',
          start: 1526277484192,
          end: 1529277484192,
          content: 'Pizza gratuite venez vite 2',
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
          res.body.data.authorID.should.be.equal(PINTY_ID);

          res.body.data.should.have.property('title');
          res.body.data.title.should.be.a('string');
          res.body.data.title.should.be.equal('Pinty restaurant 2');

          res.body.data.should.have.property('content');
          res.body.data.content.should.be.a('string');
          res.body.data.content.should.be.equal('Pizza gratuite venez vite 2');

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
          res.body.data.medias.should.be.a('array');
          res.body.data.medias.should.have.lengthOf.above(0);

          done();
        });
    });

    it('should not edit a event on PUT PATCH /event/id/:id/edit/ - pinty id is missing', done => {
      chai
        .request(server)
        .patch(`/event/id/${EVENT_ID}/edit/`)
        .set('pinty_key', PINTY_KEY)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');

          done();
        });
    });
  });

  describe('DELETE /event', function () {
    it('should delete a event on DELETE /event/id/:id/delete/', done => {
      chai
        .request(server)
        .delete(`/event/id/${EVENT_ID}/delete`)
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

    it('should not delete a event on DELETE /event/id/:id/delete - pinty id is missing', done => {
      chai
        .request(server)
        .delete(`/event/id/${EVENT_ID}/delete`)
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
  afterEach(function (done) {
    User.collection.drop();
    Place.collection.drop();
    Event.collection.drop();

    done();
  });
});