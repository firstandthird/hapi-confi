/* eslint-disable no-underscore-dangle */
'use strict';
const confi = require('confi');
const async = require('async');
const _ = require('lodash');
const path = require('path');
const aug = require('aug');

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
  options = aug(options, defaults);
  options.configPath = options.configPath || `${cwd}/conf`;

  let _server = null;

  async.autoInject({
    helpers(done) {
      done(null, {
        serverMethod(name) {
          return function(...args) {
            _server.methods[name].apply(_server, args);
          };
        }
      });
    },
    config: (helpers, done) => {
      const confiOptions = {
        path: options.configPath,
        file: options.configFile,
        url: options.configUrl,
        envVars: options.envPrefix || 'hapi'
      };
      if (options.env) {
        confiOptions.env = options.env;
      }
      if (options.config) {
        confiOptions.config = options.config;
      }
      if (options.context) {
        confiOptions.context = options.context;
      }
      confiOptions.helpers = helpers;
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
      const serverConfig = aug(config.server || {});
      const connection = config.connection || {};
      if (serverConfig.cache) {
        serverConfig.cache.engine = requireCwd(serverConfig.cache.engine);
      }
      if (process.env.PORT) {
        connection.port = process.env.PORT;
      }
      const server = new Hapi.Server(serverConfig);
      _server = server;
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
    plugins: (server, config, done) => {
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
        const views = aug(config.views);
        _.forIn(views.engines, (engine, ext) => {
          if (typeof engine === 'string') {
            views.engines[ext] = requireCwd(engine);
          }
        });
        if (!views.context) {
          views.context = {};
        }
        if (config.routePrefix) {
          views.context.routePrefix = config.routePrefix;
        }
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
        let endpoint = assetConfig.endpoint;
        if (config.routePrefix) {
          endpoint = `${config.routePrefix}${endpoint}`;
        }
        assetConfig.routeConfig.auth = false;
        server.route({
          path: `${endpoint}/{path*}`,
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
          endpoint,
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
