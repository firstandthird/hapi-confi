var hapiconfi = require('../');
var Hapi = require('hapi');
var code = require('code');
var lab = exports.lab = require('lab').script();
var _ = require('lodash')

lab.test('tests default ', (done)=>{
  hapiconfi(Hapi, {   configPath: __dirname + '/conf'}, function(err,server, config){
    code.expect(err).to.equal(null);
    code.expect(server.settings.app.blah).to.equal(true);
    code.expect(server.settings.app.math1).to.equal(50);
    code.expect(server.settings.app.multiple).to.equal(undefined);
    done();
  });
});

lab.test('tests multiple paths ', (done)=>{
  hapiconfi(Hapi, { configPath: [__dirname + '/conf', __dirname + "/conf2" ] }, function(err,server, config){
    code.expect(err).to.equal(null);
    code.expect(server.settings.app.multiple).to.equal(true);
    done();
  });
});

lab.test('test dev ', (done)=>{
  hapiconfi(Hapi, {  configPath: [__dirname + '/conf']}, function(err,server, config){
    code.expect(err).to.equal(null);
    code.expect(server.settings.app.analytics.profile).to.equal('ga-xxx');
    code.expect(server.settings.app.analytics.enabled).to.equal(false);
    code.expect(server.settings.app.testDefault).to.equal(123456);
    code.expect(server.settings.app.testDefault2).to.equal('localhost');
    code.expect(server.settings.app.testDefault3).to.equal(123456);
    code.expect(server.settings.app.isTest).to.equal(true);
    code.expect(server.settings.app.testHost).to.equal('localhost/test/path');
    code.expect(server.settings.app.apikey).to.equal('asdfasdf');
    done();
  });
});

lab.test('test prod ', (done)=>{
  hapiconfi(Hapi, {env:'production', configPath: [__dirname + '/conf']}, function(err,server, config){
    code.expect(err).to.equal(null);
    code.expect(server.settings.app.analytics.enabled).to.equal(true);
    code.expect(server.settings.app.analytics.profile).to.equal('ga-xxx');
    code.expect(server.settings.app.host).to.equal('prod');
    code.expect(config.env).to.equal('production');
    done();
  });
});

lab.test('test yaml', (done)=>{
  hapiconfi(Hapi, {env:'yaml', configPath: [__dirname + '/conf'] }, function(err,server, config){
    code.expect(err).to.equal(null);
    code.expect(server.settings.app.analytics.enabled).to.equal(true);
    code.expect(server.settings.app.yaml).to.equal(true);
    done();
  });
});
