'use strict';
const hapiconfi = require('../');
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();

lab.test('test server is initialized ', (done) => {
  hapiconfi(Hapi, { configPath: `${__dirname}/conf` }, (err, server) => {
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

lab.test('cache.enabled will disable cache ', (done) => {
  hapiconfi(Hapi, { configPath: `${__dirname}/conf4` }, (err, server) => {
    code.expect(err).to.equal(null);
    done();
  });
});

lab.test('plugins are configured ', (done) => {
  hapiconfi(Hapi, { configPath: `${__dirname}/conf` }, (err, server) => {
    code.expect(server.plugins.views).to.not.equal(undefined);
    done();
  });
});

lab.test('views are configured ', (done) => {
  hapiconfi(Hapi, { configPath: `${__dirname}/conf` }, (err, server) => {
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
    done();
  });
});

lab.test('test server can load vision view engine ', (done) => {
  hapiconfi(Hapi, { configPath: `${__dirname}/conf3` }, (err, server) => {
    code.expect(err).to.equal(null);
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
    done();
  });
});
