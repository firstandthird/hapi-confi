'use strict';
const hapiconfi = require('../');
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();

lab.test('test server is initialized ', async () => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf` });
  await server.start();
  await server.stop();
});

lab.test('cache.enabled will disable cache ', async() => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf4` });
});

lab.test('views are configured ', async() => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf` });
  let success = false;
  try {
    server.views({
      engines: {
        html: 'handlebars'
      }
    });
  } catch (exc) {
    success = true;
  }
  code.expect(success).to.equal(true);
});

lab.test('test server can load vision view engine ', async() => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf3` });
  let success = false;
  try {
    server.views({
      engines: {
        html: 'handlebars'
      }
    });
  } catch (exc) {
    success = true;
  }
  code.expect(success).to.equal(true);
  code.expect(server.registrations.vision).to.not.equal(undefined);
});
