//=======================================================================//
//     Node packages                                                     //
//=======================================================================//

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const fs = require('fs-extra');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const RateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const hat = require('hat');
const deepFreeze = require('deep-freeze');
const moment = require('moment');
const glob = require('glob');
const FB = require('fb');
const Google = require('googleapis');
const GoogleMaps = require('@google/maps');
const cron = require('node-cron');
const makeDir = require('make-dir');
const isBase64 = require('is-base64');
const base64Img = require('base64-img');
const mime = require('mime-types');
const sizeOfImage = require('image-size');
const mongo_express = require('mongo-express/lib/middleware');
global._ = require('lodash');

//=======================================================================//
//     Configs                                                           //
//=======================================================================//

// Get config (dev | prod)
global.config = deepFreeze(require('./configs/cursor'));

// Get mongo-express config
const mongo_express_config = require('./configs/mongo-express-config');

/* Logs init */
require('./functions/utils/logs').initLogs();

global.Server = {
  fs,
  hat,
  mime,
  moment,
  makeDir,
  sizeOfImage,
  base64: {
    isBase64,
    utils: base64Img,
  },
  fb: new FB.Facebook({
    appId: config.facebook.id,
    appSecret: config.facebook.secret,
  }),
  google: {
    plus: Google.plus('v1'),
    OAuth2: new Google.auth.OAuth2(config.google.id, config.google.secret),
    maps: GoogleMaps.createClient({
      key: config.google.apiKey,
      Promise: Promise,
    }),
  },
  fn: {
    error: require('./functions/utils/error'),
    api: require('./functions/utils/api'),
    routes: {}, // Look Routes (end of app.js)
    dbMethods: {},
  },
};

//=======================================================================//
//     MongoDB                                                           //
//=======================================================================//

mongoose.connect(
  `mongodb://${config.db.host}/${config.db.name}`,
  {
    useMongoClient: true,
  },
);

// Set mongoose.Promise to any Promise implementation
mongoose.Promise = Promise;

let databaseFunctions = {};
const db = mongoose.connection;

/* Getting database functions in the /database/methods folder */
glob.sync(`${__dirname}/database/methods/*.js`).forEach(file => {
  const methodName = path.basename(file, '.js');

  // Require database functions
  Server.fn.dbMethods[methodName] = require(file);
});

db.on('error', function(err) {
  __logError('Connection error to mongodb', err);
  process.exit(3);
});

db.once('open', function() {
  __log(`Mongodb connected (port:27017) [${config.env}]`);
});

//=======================================================================//
//     Express                                                           //
//=======================================================================//

const app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, pinty_id, pinty_key',
  );
  next();
});
app.options('/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, pinty_id, pinty_key',
  );
  res.sendStatus(200);
});

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
//app.use('/public', express.static(`${__dirname}/public`));
app.use('/public/media', express.static(`${__dirname}/public/media/${config.env}`));

// Mongodb webinterface
if (config.env == 'prod') app.use('/db', mongo_express(mongo_express_config));

app.disable('x-powered-by');
app.use(helmet());
app.use(
  bodyParser.json({
    limit: '20mb',
  }),
);
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '20mb',
  }),
);

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), {
  flags: 'a',
});

// setup the logger
app.use(
  morgan('combined', {
    stream: accessLogStream,
  }),
);
app.use(cookieParser());

const apiLimiter = new RateLimit({
  windowMs: 60 * 1000,
  max: 5,
  delayAfter: 1,
  delayMs: 3 * 1000,
});

app.listen(config.server.port, () => {
  __log(`API runining on port ${config.server.port} [${config.env}]!`);
});

var limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
});

app.use(limiter); //  apply to all requests

//=======================================================================//
//     Routes          		                                             //
//=======================================================================//

let routes = {};

/* Getting routes in the /routes folder */
glob.sync(`${__dirname}/routes/*.js`).forEach(file => {
  const routeName = path.basename(file, '.js');

  // Save routes
  routes[routeName] = require(file).router(express, routeName);

  // Require routes functions
  Server.fn.routes[routeName] = require(`${__dirname}/functions/routes/${routeName}`);

  // Use routes
  app.use(`/${routeName}`, routes[routeName]);
});

/* Other routes */

app.all('*', Server.fn.error.page404);

//=======================================================================//
//     Refresh Fb access Tokens                                          //
//=======================================================================//
/*every 1st of the month*/

if (config.env == 'prod') {
  cron.schedule(
    '* * 1 * *',
    function() {
      Server.fn.dbMethods.user.getTokenList().then(tokens => {
        tokens.forEach(function(token) {
          Server.fb.api(
            '/me',
            {
              fields: ['id'],
              access_token: token.get('accessToken'),
            },
            function(res) {
              if (res) {
                if (!res || res.error) {
                  console.log(!res ? 'error occurred' : res.error);
                  return Server.fn.api.jsonError(401, res.error.message, res.error);
                }
              }
            },
          );
        });
      });
    },
    true,
  );
}

module.exports = app; // for testing
