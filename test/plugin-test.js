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

lab.test('loads plugins in order of dependencies ', (done) => {
  hapiconfi(Hapi, { env: 'broke', configPath: `${__dirname}/conf_plugins` }, (err, server) => {
    // the 'broke' config has the wrong dependency order and will crash:
    code.expect(err).to.not.equal(null);
    done();
  });
});

lab.test('logs to console if it sees the deprecated "_priority" field ', (done) => {
  hapiconfi(Hapi, { env: 'report', configPath: `${__dirname}/conf_plugins` }, (err, server) => {
    code.expect(err).to.equal(null);
    done();
  });
});
