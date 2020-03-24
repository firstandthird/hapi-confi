const tap = require('tap');
const hapiconfi = require('../index.js');
const Hapi = require('@hapi/hapi');

tap.test('test server is initialized ', async () => {
  const { server, config } = await hapiconfi(Hapi, { configPath: `${__dirname}/conf` });
  const schema1 = require('./schema1.js');
  const schema2 = require('./schema2.js');
  await schema1.validate({ email: 'nowhere@nowhere.com' });
  await schema2.validate({ email: 'nowhere@nowhere.com' });
  await server.start();
  await server.stop();
});
