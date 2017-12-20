'use strict';
const hapiConfi = require('../');
const Hapi = require('hapi');

const options = {
  // tell hapi-confi where to look for config files:
  configPath: `${__dirname}/conf`,
  // tell hapi-confi to print out more info about the setup:
  verbose: true,
  configRoute: '/config'
};

//   'server' will be a fully-configured hapi server!
const f = async() => {
  const { server } = await hapiConfi(Hapi, options);
  server.method('add', (a, b) => a + b);
  server.route({
    path: '/',
    method: 'get',
    handler: (request, h) => request.server.methods.add(1, 2)
  });
  server.route({
    path: '/1d',
    method: 'get',
    handler: (request, h) => request.server.settings.app.oneDay
  });
  server.route({
    path: '/method',
    method: 'get',
    handler: (request, h) => request.server.settings.app.method(1, 2)
  });
  await server.start();
  server.log(['server', 'info'], `Server started ${server.info.uri}`);
};

f();
