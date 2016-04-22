var confi = require('confi');
var async = require('async');
var _ = require('lodash');
var path = require('path');

var cwd = process.cwd();

var requireCwd = function(req) {
  if (req[0] === '.') {
    return require(path.join(cwd, req));
  }
  return require(req);
};

module.exports = function(Hapi, options, allDone) {
  if (typeof options === 'function') {
    allDone = options;
    options = {};
  }

  options.configPath = options.configPath || cwd + '/conf';
  async.waterfall([
    //read config
    function(done) {
      var confiOptions = {
        path: options.configPath
      };
      if (options.env) {
        confiOptions.env = options.env;
      }
      var config = confi(confiOptions);

      done(null, config);
    },
    //set up server
    function(config, done) {
      var serverConfig = _.cloneDeep(config.server || {});

      var connection = config.connection || {};

      if (serverConfig.cache) {
        serverConfig.cache.engine = requireCwd(serverConfig.cache.engine);
      }

      if (process.env.PORT) {
        connection.port = process.env.PORT;
      }

      var server = new Hapi.Server(serverConfig);

      server.connection(connection);

      server.settings.app = config;

      done(null, server, config);
    },
    //before hook
    function(server, config, done) {
      if (typeof options.before !== 'function') {
        return done(null, server, config);
      }

      options.before(server, config, done);
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
        value.reporter = requireCwd('good-' + key);
        reporters.push(value);
      });

      if (reporters.length !== 0) {
        config.logging.reporters = reporters;

        server.register({
          register: requireCwd('good'),
          options: config.logging
        }, function(err) {
          server.log(['hapi-confi'], { message: 'good reporters loaded', reporters: keys });
          done(err, server, config);
        });
      }
    },
    //load auth plugins
    function(server, config, done) {
      if (!config.authPlugins) {
        return done(null, server, config);
      }

      async.forEachOfSeries(config.authPlugins, function(value, key, eachDone) {
        if (typeof value === 'undefined' || value === null) {
          value = {};
        }
        if (value === false || value._enabled === false) {
          return eachDone();
        }
        delete value._enabled;
        server.log(['hapi-confi'], { message: 'auth plugin loaded', plugin: key, options: value });
        server.register({
          register: requireCwd(key),
          options: value
        }, eachDone);
      }, function(err) {
        done(err, server, config);
      });
    },
    //load strategies
    function(server, config, done) {
      _.forIn(config.strategies, function(value, name) {
        server.log(['hapi-confi'], { message: 'strategy loaded', strategy: name, options: value });
        var profileFn = _.get(value, 'options.provider.profile');
        if (typeof profileFn === 'string') {
          value.options.provider.profile = function(credentials, params, get, callback) {
            server.methods[profileFn](credentials, params, get, callback);
          };
        }
        server.auth.strategy(name, value.scheme, value.mode, value.options);
      });
      done(null, server, config);
    },
    //load plugins
    function(server, config, done) {
      if (!config.plugins) {
        return done(null, server, config);
      }

      var pluginArr = [];
      _.forIn(config.plugins, function(value, key) {
        if (value === null) {
          value = {};
        }
        if (value === false) {
          return;
        }
        if (value._enabled === false) {
          return;
        }
        value._name = key;
        pluginArr.push(value);
      });

      pluginArr = _.sortBy(pluginArr, '_priority');

      async.eachSeries(pluginArr, function(plugin, eachDone) {
        var name = plugin._name;
        delete plugin._name;
        delete plugin._enabled;
        delete plugin._priority;
        server.log(['hapi-confi'], { message: 'plugin loaded', plugin: name, options: plugin });
        server.register({
          register: requireCwd(name),
          options: plugin
        }, eachDone);
      }, function(err) {
        done(err, server, config);
      });
    },
    function(server, config, done) {
      if (config.views) {
        _.forIn(config.views.engines, function(engine, ext) {
          if (typeof engine === 'string') {
            config.views.engines[ext] = requireCwd(engine);
          }
        });
        server.views(config.views);
        server.log(['hapi-confi'], { message: 'views configured' });
      }
      done(null, server, config);
    }

  ], allDone);
};
