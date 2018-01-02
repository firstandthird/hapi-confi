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

lab.test('loads plugins in order of dependencies ', async() => {
  const { server } = await hapiconfi(Hapi, { env: 'depend', configPath: `${__dirname}/dependencies` });
  code.expect(server.settings.app.order.length).to.equal(3); // make sure we load all 3 plugins
  code.expect(server.settings.app.order).to.equal([1, 2, 3]); // make sure we load all 3 plugins
});

lab.test('notifies if deprecated _priority field still used', async() => {
  const oldLog = console.log;
  const results = [];
  console.log = (input) => {
    results.push(input);
  };
  const { server } = await hapiconfi(Hapi, { configPath: `${__dirname}/deprecated` });
  console.log = oldLog;
  code.expect(results.length).to.equal(1);
  code.expect(results[0]).to.include('field used by ./test/loadMeFirst.js is deprecated');
});
