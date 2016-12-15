'use strict';
const hapiconfi = require('../');
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();

lab.test('test server is initialized ', (done) => {
  hapiconfi(Hapi, { configPath: `${__dirname}/conf_plugins` }, (err, server) => {
    code.expect(err).to.equal(null);
    server.start((startErr) => {
      code.expect(startErr).to.equal(undefined);
      server.stop((stopErr) => {
        code.expect(stopErr).to.equal(undefined);
        done();
      });
    });
  });
});
