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

lab.test('logging is configured ', (done) => {
  hapiconfi(Hapi, { configPath: `${__dirname}/conf` }, (err, server) => {
    code.expect(typeof server.registrations.good).to.equal('object');
    code.expect(typeof server.registrations.good.options.reporters).to.equal('object');
    code.expect(server.registrations.good.options.reporters.length).to.equal(1);
    code.expect(server.registrations.good.options.reporters[0].events.log).to.equal('*');
    done();
  });
});

lab.test('auth is configured ', (done) => {
  hapiconfi(Hapi, { configPath: `${__dirname}/conf` }, (err, server) => {
    code.expect(server.auth).to.not.equal(undefined);
    code.expect(typeof server.auth.scheme).to.equal('function');
    code.expect(typeof server.auth.default).to.equal('function');
    code.expect(typeof server.registrations['hapi-auth-cookie']).to.equal('object');
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
lab.test('strategies are configured ', (done) => {
  hapiconfi(Hapi, { configPath: `${__dirname}/conf` }, (err, server) => {
    let success = false;
    try {
      const session = server.settings.app.env.strategies;
      server.auth.strategy('session', 'cookie', 'try', {});
    } catch (e) {
      success = true;
    }
    code.expect(success).to.equal(true);
    done();
  });
});
