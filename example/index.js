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
  server.route({
    path: '/',
    method: 'get',
    handler: (request, reply) => {
      reply('ok');
    }
  });
  server.start((startErr) => {
    if (startErr) {
      throw startErr;
    }
    server.log(['server', 'info'], `Server started ${server.info.uri}`);
  });
});
