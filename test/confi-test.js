'use strict';
const hapiconfi = require('../index.js');
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();

lab.test('tests default ', async () => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf` });
  code.expect(server.settings.app.blah).to.equal(true);
  code.expect(server.settings.app.math1).to.equal(50);
  code.expect(server.settings.app.multiple).to.equal(undefined);
});

lab.test('tests default with context', async () => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf`, config: { blah: 'hoover' } });
  code.expect(server.settings.app.blah).to.equal('hoover');
  code.expect(server.settings.app.math1).to.equal(50);
  code.expect(server.settings.app.multiple).to.equal(undefined);
});

lab.test('tests multiple paths ', async() => {
  const { server, config } = await hapiconfi(Hapi, { configPath: [`${__dirname}/conf`, `${__dirname}/conf2`] });
  code.expect(server.settings.app.multiple).to.equal(true);
});

lab.test('test dev ', async () => {
  const { server, config } = await hapiconfi(Hapi, { configPath: [`${__dirname}/conf`] });
  code.expect(server.settings.app.analytics.profile).to.equal('ga-xxx');
  code.expect(server.settings.app.analytics.enabled).to.equal(false);
  code.expect(server.settings.app.testDefault).to.equal(123456);
  code.expect(server.settings.app.testDefault2).to.equal('localhost');
  code.expect(server.settings.app.testDefault3).to.equal(123456);
  code.expect(server.settings.app.isTest).to.equal(true);
  code.expect(server.settings.app.testHost).to.equal('localhost/test/path');
  code.expect(server.settings.app.apikey).to.equal('asdfasdf');
});

lab.test('test prod ', async() => {
  const { server, config } = await hapiconfi(Hapi, { env: 'production', configPath: [`${__dirname}/conf`] });
  code.expect(server.settings.app.analytics.enabled).to.equal(true);
  code.expect(server.settings.app.analytics.profile).to.equal('ga-xxx');
  code.expect(server.settings.app.host).to.equal('prod');
  code.expect(config.env).to.equal('production');
});

lab.test('test yaml', async() => {
  const { server, config } = await hapiconfi(Hapi, { env: 'yaml', configPath: [`${__dirname}/conf`] });
  code.expect(server.settings.app.analytics.enabled).to.equal(true);
  code.expect(server.settings.app.yaml).to.equal(true);
});

lab.test('returns error if it cannot parse any config file ', async() => {
  try {
    const { server, config } = await hapiconfi(Hapi, { configPath: [`${__dirname}/conf`, `${__dirname}/dysfunctional`] });
  } catch (err) {
    code.expect(typeof err).to.equal('object');
    code.expect(err.toString().startsWith('YAMLException:')).to.equal(true);
  }
});
