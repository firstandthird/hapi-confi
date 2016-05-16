'use strict';
const hapiConfi = require('../');
const Hapi = require('hapi');

const options = {
  configPath: `${__dirname}/conf`,
};

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
