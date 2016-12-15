/* eslint-disable no-underscore-dangle */
'use strict';
const confi = require('confi');
const async = require('async');
const _ = require('lodash');
const path = require('path');
const Deptree = require('deptree');

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
        if (config.verbose === true) {
          options.verbose = true;
        }
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
    logging: ['beforeHook', (done, result) => {
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
          done(err);
        });
      } else {
        return done();
      }
    }],
    plugins: ['logging', (done, result) => {
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
      // use deptree to resolve the order in which the plugins load
      // based on their _dependencies:
      const deptree = new Deptree();
      pluginArr.forEach((plugin) => {
        // priority is deprecated:
        if (plugin._priority) {
          server.log(['error', 'hapi-confi'], `WARNING: '_priority' field is deprecated, please migrate your plugins to use the _dependencies format`);
        }
        deptree.add(plugin._name, plugin._dependencies ? plugin._dependencies : []);
      });
      pluginArr = _.reduce(deptree.resolve(), (memo, pluginName) => {
        for (let i = 0; i < pluginArr.length; i++) {
          if (pluginName === pluginArr[i]._name) {
            memo.push(pluginArr[i]);
            return memo;
          }
        }
      }, []);
      // now that dependency is resolved, load the plugins in correct order:
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
    }],
    views: ['plugins', (done, result) => {
      const server = result.server;
      const config = result.config;
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
    }],
    assets: ['plugins', (done, results) => {
      const assetConfig = results.config.assets;
      if (assetConfig && assetConfig.endpoint) {
        //TODO: check if inert is loaded
        //TODO: cache support
        if (!assetConfig.routeConfig) {
          assetConfig.routeConfig = {};
        }
        assetConfig.routeConfig.auth = false;
        results.server.route({
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
    }]
  }, (autoErr, result) => {
    if (autoErr) {
      return allDone(autoErr);
    }
    allDone(null, result.server, result.config);
  });
};
