var confi = require('confi');
var async = require('async');
var _ = require('lodash');
var path = require('path');

var cwd = process.cwd();

var requireCwd = function(req) {
  return require(path.join(cwd, 'node_modules', req));
};

module.exports = function(Hapi, options, done) {

  if (typeof options === 'function') {
    done = options;
    options = {};
  }

  options.configPath = options.configPath || cwd + '/conf';

  async.waterfall([
    //read config
    function(done) {
      var config = confi({
        path: options.configPath
      });

      done(null, config);
    },
    //set up server
    function(config, done) {
      var serverConfig = _.cloneDeep(config.server || {});

      if (serverConfig.cache) {
        serverConfig.cache.engine = requireCwd(serverConfig.cache.engine);
      }

      if (process.env.PORT) {
        config.connection.port = process.env.PORT;
      }

      var server = new Hapi.Server(serverConfig);

      server.connection(config.connection);

      server.app.config = config;

      done(null, server, config);

    },
    //set up logging
    function(server, config, done) {
      if (!config.logging) {
        return done(null, server, config);
      }
      var reporters = [];
      var keys = [];

      _.forIn(config.logging.reporters, function(value, key) {
        if (value === false || value._enabled === false) {
          return;
        }
        delete value._enabled;
        keys.push(key);
        value.reporter = requireCwd('good-'+key);
        reporters.push(value);
      });

      if (reporters.length !== 0) {
        config.logging.reporters = reporters;

        server.register({
          register: requireCwd('good'),
          options: config.logging
        }, function(err) {
          server.log(['hapi-confi'], { message: 'good reporters loaded', reporters: keys});
          done(err, server, config);
        });
      }

    },
    //load auth plugins
    function(server, config, done) {
      if (!config.authPlugins) {
        return done(null, server, config);
      }

      async.forEachOfSeries(config.authPlugins, function(value, key, done) {
        if (typeof value === 'undefined' || value === null) {
          value = {};
        }
        if (value === false || value._enabled === false) {
          return;
        }
        delete value._enabled;
        server.log(['hapi-confi'], { message: 'auth plugin loaded', plugin: key, options: value });
        server.register({
          register: requireCwd(key),
          options: value
        }, done);
      }, function(err) {
        done(err, server, config);
      });

    },
    //load strategies
    function(server, config, done) {
      _.forIn(config.strategies, function(value, name) {
        server.log(['hapi-confi'], { message: 'strategy loaded', strategy: name, options: value });
        server.auth.strategy(name, value.scheme, value.mode, value.options);
      });
      done(null, server, config);
    },
    //load plugins
    function(server, config, done) {
      if (!config.plugins) {
        return done(null, server, config);
      }

      async.forEachOfSeries(config.plugins, function(value, key, done) {
        if (typeof value === 'undefined' || value === null) {
          value = {};
        }
        if (value === false || value._enabled === false) {
          return;
        }
        delete value._enabled;
        server.log(['hapi-confi'], { message: 'plugin loaded', plugin: key, options: value });
        server.register({
          register: requireCwd(key),
          options: value
        }, done);
      }, function(err) {
        done(err, server, config);
      });
    }

  ], done);
};
