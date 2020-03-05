const proxy = require('redbird')({
  port: 80,
  letsencrypt: {
    path: __dirname + '/certs',
    port: 9999,
  },
  ssl: {
    port: 443,
    http2: true,
  },
});

const dev = require('../API/configs/dev');
const prod = require('../API/configs/prod');

//=======================================================================//
//     Proxy                                                             //
//=======================================================================//

proxy.register(`pinty.en-f.eu/${dev.server.name}`, `http://127.0.0.1:${dev.server.port}`);

proxy.register(`pinty.en-f.eu/${prod.server.name}`, `http://127.0.0.1:${prod.server.port}`);

proxy.register(`pinty.en-f.eu`, `http://127.0.0.1`, {
  ssl: {
    letsencrypt: {
      email: 'iphonitest@gmail.com', // Domain owner/admin email
      production: true, // WARNING: Only use this flag when the proxy is verified to work correctly to avoid being banned!
    },
  },
});

proxy.register(`pinty.en-f.eu/db`, `http://127.0.0.1:80/api/db`);
