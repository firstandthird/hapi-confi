const tap = require('tap');
const hapiconfi = require('../index.js');
const Hapi = require('hapi');

tap.test('tests default ', async (t) => {
  process.env.PORT = 8080;
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf` });
  t.equal(server.info.port, 8080, 'by default port is set to env.PORT');
  t.equal(server.settings.app.blah, true);
  t.equal(server.settings.app.math1, 50);
  t.equal(server.settings.app.multiple, undefined);
  t.end();
});

tap.test('portOverride lets you override default listening port ', async (t) => {
  process.env.PORT = 8080;
  const { server, config } = await hapiconfi(Hapi, { portOverride: 9000, configPath: `${__dirname}/conf` });
  t.equal(server.info.port, 9000);
  t.end();
});

tap.test('tests default with context', async (t) => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf`, config: { blah: 'hoover' } });
  t.equal(server.settings.app.blah, 'hoover');
  t.equal(server.settings.app.math1, 50);
  return t.equal(server.settings.app.multiple, undefined);
});

tap.test('tests multiple paths ', async(t) => {
  const { server, config } = await hapiconfi(Hapi, { configPath: [`${__dirname}/conf`, `${__dirname}/conf2`] });
  t.equal(server.settings.app.multiple, true);
});

tap.test('test dev ', async (t) => {
  const { server, config } = await hapiconfi(Hapi, { configPath: [`${__dirname}/conf`] });
  t.equal(server.settings.app.analytics.profile, 'ga-xxx');
  t.equal(server.settings.app.analytics.enabled, false);
  t.equal(server.settings.app.testDefault, 123456);
  t.equal(server.settings.app.testDefault2, 'localhost');
  t.equal(server.settings.app.testDefault3, 123456);
  t.equal(server.settings.app.isTest, true);
  t.equal(server.settings.app.testHost, 'localhost/test/path');
  t.equal(server.settings.app.apikey, 'asdfasdf');
});

tap.test('test prod ', async(t) => {
  const { server, config } = await hapiconfi(Hapi, { env: 'production', configPath: [`${__dirname}/conf`] });
  t.equal(server.settings.app.analytics.enabled, true);
  t.equal(server.settings.app.analytics.profile, 'ga-xxx');
  t.equal(server.settings.app.host, 'prod');
  t.equal(config.env, 'production');
});

tap.test('test yaml', async(t) => {
  const { server, config } = await hapiconfi(Hapi, { env: 'yaml', configPath: [`${__dirname}/conf`] });
  t.equal(server.settings.app.analytics.enabled, true);
  t.equal(server.settings.app.yaml, true);
});

tap.test('returns error if it cannot parse any config file ', async(t) => {
  try {
    const { server, config } = await hapiconfi(Hapi, { configPath: [`${__dirname}/conf`, `${__dirname}/dysfunctional`] });
  } catch (err) {
    t.equal(typeof err, 'object');
    t.match(err.toString(), 'YAMLException:');
  }
});

tap.test('tests assets', async (t) => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf`, config: {
    routePrefix: '/api',
    assets: {
      endpoint: '/blah',
      path: __dirname
    }
  } });
  const res = await server.inject({
    method: 'get',
    url: '/api/blah/server-test.js'
  });
  t.match(res.payload, 'tap.test');
});
