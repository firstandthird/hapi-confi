const tap = require('tap');
const hapiconfi = require('../index.js');
const Hapi = require('hapi');

tap.test('test server is initialized ', async () => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf` });
  await server.start();
  await server.stop();
});

tap.test('cache.enabled will disable cache ', async(t) => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf4` });
});

tap.test('registers event types with the server ', async(t) => {
  const { server, config } = await hapiconfi(Hapi, { verbose: true, configPath: `${__dirname}/events` });
  let called = 0;
  server.events.on('user.register', () => {
    called++;
  });
  server.events.on('user.login', () => {
    called++;
  });
  server.events.emit('user.register');
  server.events.emit('user.login');
  await new Promise(resolve => setTimeout(resolve, 500));
  return t.equal(called, 2);
});

tap.test('views are configured ', async(t) => {
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
  return t.equal(success, true);
});

tap.test('test server can load vision view engine ', async(t) => {
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
  t.equal(success, true);
  return t.notEqual(server.registrations.vision, undefined);
});

tap.test('loads plugins in order of dependencies ', async(t) => {
  const { server } = await hapiconfi(Hapi, { env: 'depend', configPath: `${__dirname}/dependencies` });
  t.equal(server.settings.app.order.length, 4); // make sure we load all 3 plugins
  return t.match(server.settings.app.order, ['first', 1, 2, 'last']);
});

tap.test('handles complex plugin dependencies ', async(t) => {
  const { server } = await hapiconfi(Hapi, { env: 'depend', configPath: `${__dirname}/complexDependencies` });
  t.equal(server.settings.app.order.length, 5); // make sure we load all 3 plugins
  return t.match(server.settings.app.order, ['first', 3, 2, 'last', 1]);
});

tap.test('error for circular plugin dependencies ', async(t) => {
  try {
    await hapiconfi(Hapi, { env: 'depend', configPath: `${__dirname}/circularDependencies` });
  } catch (e) {
    t.match(e.toString(), 'Circular dependency:');
    return;
  }
  t.fail();
});

tap.test('will throw an error if deprecated _priority field still used', async(t) => {
  try {
    await hapiconfi(Hapi, { configPath: `${__dirname}/deprecated` });
  } catch (e) {
    t.match(e.toString(), '"_priority" field used by');
  }
});

tap.test('will log config if env variable DEBUG_CONFI is set', async(t) => {
  process.env.DEBUG_CONFI = true;
  const oldLog = console.log;
  const results = [];
  console.log = (input) => {
    return results.push(input);
  };
  await hapiconfi(Hapi, { env: 'depend', configPath: `${__dirname}/complexDependencies` });
  console.log = oldLog;
  t.equal(results.length, 1);
  const loggedObject = JSON.parse(results[0]);
  t.equal(typeof loggedObject, 'object');
  t.equal(Array.isArray(loggedObject.order), true);
});

tap.test('serverMethod helper can find server.methods at any level', async(t) => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/confHelpers` });
  let called = 0;
  server.method('add', a => { called += a; });
  server.method('nested.add', a => { called += a; });
  config.method(1);
  t.equal(called, 1);
  config.nestedMethod(1);
  t.equal(called, 2);
});
