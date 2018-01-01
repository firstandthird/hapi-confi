'use strict';
const hapiconfi = require('../');
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();
/*
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
  try {
    const { server, config } = await hapiconfi(Hapi, { env: 'broke', configPath: `${__dirname}/conf_plugins` });
    // the 'broke' config has the wrong dependency order and will crash:
  } catch (err) {
    console.log('---------------------------')
    console.log(err)
    code.expect(err).to.not.equal(null);
  }
});
*/
lab.test('logs to console if it sees the deprecated "_priority" field ', async() => {
  const { server, config } = await hapiconfi(Hapi, { env: 'report', configPath: `${__dirname}/conf_plugins` });
  done();
});
