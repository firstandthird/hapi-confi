/* eslint-disable no-underscore-dangle */
'use strict';
const confi = require('confi');
const async = require('async');
const _ = require('lodash');
const path = require('path');

let log = () => {
  // stubbed function
};
const defaults = {
  verbose: false
};

const cwd = process.cwd();

const requireCwd = (req) => {
  if (req[0] === '.') {
    return require(path.join(cwd, req)); // eslint-disable-line global-require
  }
  return require(req); // eslint-disable-line global-require
};

module.exports = (Hapi, options, allDone) => {
  if (typeof options === 'function') {
    allDone = options;
    options = {};
  }
  options = _.defaults(options, defaults);
  options.configPath = options.configPath || `${cwd}/conf`;

  async.autoInject({
    config: (done) => {
      const confiOptions = {
        path: options.configPath
      };
      if (options.env) {
        confiOptions.env = options.env;
      }
      if (options.context) {
        confiOptions.context = options.context;
      }
      confi(confiOptions, (err, config) => {
        if (err) {
          return done(err);
        }
        if (config.verbose === true) {
          options.verbose = true;
        }
        return done(null, config);
      });
    },
    server: (config, done) => {
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
    },
    beforeHook: (server, config, done) => {
      if (typeof options.before !== 'function') {
        return done();
      }
      options.before(server, config, done);
    },
    logging: (server, config, beforeHook, done) => {
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
          done(err);
        });
      } else {
        return done();
      }
    },
    plugins: (server, config, logging, done) => {
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
      }, done);
    },
    views: (server, config, plugins, done) => {
      if (config.views) {
        const views = config.views;
        _.forIn(views.engines, (engine, ext) => {
          if (typeof engine === 'string') {
            views.engines[ext] = requireCwd(engine);
          }
        });
        server.views(views);
        log(['hapi-confi'], { message: 'views configured' });
      }
      done();
    },
    assets: (server, config, plugins, done) => {
      const assetConfig = config.assets;
      if (assetConfig && assetConfig.endpoint) {
        //TODO: check if inert is loaded
        //TODO: cache support
        if (!assetConfig.routeConfig) {
          assetConfig.routeConfig = {};
        }
        assetConfig.routeConfig.auth = false;
        server.route({
          path: `${assetConfig.endpoint}/{path*}`,
          method: 'GET',
          config: assetConfig.routeConfig,
          handler: {
            directory: {
              path: assetConfig.path
            }
          }
        });
        log(['hapi-confi'], {
          message: 'assets configured',
          endpoint: assetConfig.endpoint,
          path: assetConfig.path
        });
      }
      done();
    }
  }, (autoErr, result) => {
    if (autoErr) {
      return allDone(autoErr);
    }
    allDone(null, result.server, result.config);
  });
};
