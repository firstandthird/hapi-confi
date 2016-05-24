'use strict';
const confi = require('confi');
const async = require('async');
const _ = require('lodash');
const path = require('path');

// by default, don't print:
let log = () => {
  // empty function
};
const defaults = {
  verbose: false
};

const cwd = process.cwd();

const requireCwd = (req) => {
  if (req[0] === '.') {
    return require(path.join(cwd, req));
  }
  return require(req);
};

module.exports = (Hapi, options, allDone) => {
  if (typeof options === 'function') {
    allDone = options;
    options = {};
  }
  options = _.defaults(options, defaults);
  options.configPath = options.configPath || `${cwd}/conf`;

  async.auto({
    config: (done) => {
      const confiOptions = {
        path: options.configPath
      };
      if (options.env) {
        confiOptions.env = options.env;
      }
      try {
        const config = confi(confiOptions);
        return done(null, config);
      } catch (exc) {
        return done(exc);
      }
    },
    server: ['config', (done, result) => {
      const config = result.config;
      const serverConfig = _.cloneDeep(config.server || {});
      const connection = config.connection || {};
      if (serverConfig.cache) {
        serverConfig.cache.engine = requireCwd(serverConfig.cache.engine);
      }
      if (process.env.PORT) {
        connection.port = process.env.PORT;
      }
      const server = new Hapi.Server(serverConfig);
      if (options.verbose) {
        log = (tags, msg) => {
          server.log(tags, msg);
        };
      }
      server.connection(connection);
      server.settings.app = config;
      done(null, server);
    }],
    beforeHook: ['server', (done, result) => {
      if (typeof options.before !== 'function') {
        return done();
      }
      options.before(result.server, result.config, done);
    }],
    log: ['beforeHook', (done, result) => {
      const server = result.server;
      const config = result.config;
      if (!config.logging) {
        return done(null, server, config);
      }
      const reporters = [];
      const keys = [];
      _.forIn(config.logging.reporters, (value, key) => {
        if (value === false || value._enabled === false) {
          return;
        }
        delete value._enabled;
        keys.push(key);
        value.reporter = requireCwd(`good-${key}`);
        reporters.push(value);
      });
      if (reporters.length !== 0) {
        config.logging.reporters = reporters;
        server.register({
          register: requireCwd('good'),
          options: config.logging
        }, (err) => {
          log(['hapi-confi'], { message: 'good reporters loaded', reporters: keys });
          done(err, server, config);
        });
      } else {
        return done(null, server, config);
      }
    }],
    auth: ['log', (done, result) => {
      const server = result.server;
      const config = result.config;
      if (!config.authPlugins) {
        return done(null, server, config);
      }
      async.forEachOfSeries(config.authPlugins, (value, key, eachDone) => {
        if (typeof value === 'undefined' || value === null) {
          value = {};
        }
        if (value === false || value._enabled === false) {
          return eachDone();
        }
        delete value._enabled;
        log(['hapi-confi'], { message: 'auth plugin loaded', plugin: key, options: value });
        server.register({
          register: requireCwd(key),
          options: value
        }, eachDone);
      }, (err) => {
        done(err, server, config);
      });
    }],
    strategies: ['auth', (done, result) => {
      const server = result.server;
      const config = result.config;
      _.forIn(config.strategies, (value, name) => {
        log(['hapi-confi'], { message: 'strategy loaded', strategy: name, options: value });
        const profileFn = _.get(value, 'options.provider.profile');
        if (typeof profileFn === 'string') {
          value.options.provider.profile = (credentials, params, get, callback) => {
            server.methods[profileFn](credentials, params, get, callback);
          };
        }
        server.auth.strategy(name, value.scheme, value.mode, value.options);
      });
      done(null, server, config);
    }],
    plugins: ['strategies', (done, result) => {
      const server = result.server;
      const config = result.config;
      if (!config.plugins) {
        return done(null, server, config);
      }
      let pluginArr = [];
      _.forIn(config.plugins, (value, key) => {
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
      async.eachSeries(pluginArr, (plugin, eachDone) => {
        const name = plugin._name;
        delete plugin._name;
        delete plugin._enabled;
        delete plugin._priority;
        log(['hapi-confi'], { message: 'plugin loaded', plugin: name, options: plugin });
        server.register({
          register: requireCwd(name),
          options: plugin
        }, eachDone);
      }, (err) => {
        done(err, server, config);
      });
    }],
    views: ['plugins', 'strategies', 'beforeHook', (done, result) => {
      const server = result.server;
      const config = result.config;
      if (config.views) {
        _.forIn(config.views.engines, (engine, ext) => {
          if (typeof engine === 'string') {
            config.views.engines[ext] = requireCwd(engine);
          }
        });
        server.views(config.views);
        log(['hapi-confi'], { message: 'views configured' });
      }
      done(null, server, config);
    }]
  }, (autoErr, result) => {
    if (autoErr) {
      return allDone(autoErr);
    }
    allDone(null, result.server, result.config);
  });
};
