'use strict';
const hapiConfi = require('../');
const Hapi = require('hapi');

const options = {
  // tell hapi-confi where to look for config files:
  configPath: `${__dirname}/conf`,
  // tell hapi-confi to print out more info about the setup:
  verbose: true
};

// 'server' will be a fully-configured hapi server!
hapiConfi(Hapi, options, (err, server) => {
  if (err) {
    throw err;
  }
  server.method('add', (a, b, done) => {
    done(null, a + b);
  });
  server.route({
    path: '/',
    method: 'get',
    handler: (request, reply) => {
      request.server.methods.add(1, 2, reply);
    }
  });
  server.route({
    path: '/1d',
    method: 'get',
    handler: (request, reply) => {
      reply(null, request.server.settings.app.oneDay);
    }
  });
  server.route({
    path: '/method',
    method: 'get',
    handler: (request, reply) => {
      request.server.settings.app.method(1, 2, reply);
    }
  });
  server.start((startErr) => {
    if (startErr) {
      throw startErr;
    }
    server.log(['server', 'info'], `Server started ${server.info.uri}`);
  });
});
