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
  code.expect(server.settings.app.order.length).to.equal(4); // make sure we load all 3 plugins
  code.expect(server.settings.app.order).to.equal(['first', 1, 2, 'last']); // make sure we load all 3 plugins
});

lab.test('handles complex plugin dependencies ', async() => {
  const { server } = await hapiconfi(Hapi, { env: 'depend', configPath: `${__dirname}/complexDependencies` });
  code.expect(server.settings.app.order.length).to.equal(5); // make sure we load all 3 plugins
  code.expect(server.settings.app.order).to.equal(['first', 3, 2, 'last', 1]); // make sure we load all 3 plugins
});

lab.test('error for circular plugin dependencies ', async() => {
  try {
    await hapiconfi(Hapi, { env: 'depend', configPath: `${__dirname}/circularDependencies` });
  } catch (e) {
    code.expect(e.toString()).to.include('Circular dependency:');
    return;
  }
  lab.fail();
});

lab.test('will throw an error if deprecated _priority field still used', async() => {
  try {
    await hapiconfi(Hapi, { configPath: `${__dirname}/deprecated` });
  } catch (e) {
    code.expect(e.toString()).to.include('"_priority" field used by');
  }
});

lab.test('will log config if env variable DEBUG_CONFI is set', async() => {
  process.env.DEBUG_CONFI = true;
  const oldLog = console.log;
  const results = [];
  console.log = (input) => {
    results.push(input);
  };
  await hapiconfi(Hapi, { env: 'depend', configPath: `${__dirname}/complexDependencies` });
  console.log = oldLog;
  code.expect(results.length).to.equal(1);
  code.expect(typeof results[0]).to.equal('object');
  code.expect(Array.isArray(results[0].order)).to.equal(true);
});
