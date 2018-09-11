/* eslint-disable no-underscore-dangle */
'use strict';
const confi = require('confi');
const path = require('path');
const aug = require('aug');
const get = require('lodash.get');
let log = () => {
  // stubbed function
};

const defaults = {
  verbose: false
};

const requireCwd = (req) => {
  if (req[0] === '.') {
    return require(path.join(cwd, req)); // eslint-disable-line global-require
  }
  return require(req); // eslint-disable-line global-require
};

const cwd = process.cwd();

module.exports = async (Hapi, options) => {
  options = aug({}, defaults, options);
  options.configPath = options.configPath || `${cwd}/conf`;

  let _server = null;

  // load confi helpers:
  const helpers = {
    serverMethod(name) {
      return function(...args) {
        return get(_server.methods, name).apply(_server, args);
      };
    }
  };

  // load config with confi:
  const config = await require('./lib/config.js')(options, helpers);

  // instantiate the server:
  const server = await require('./lib/server.js')(Hapi, config, options, requireCwd);

  // set _server, this is used up above by helpers:
  _server = server;

  // only log hapi-confi setup in verbose mode:
  if (options.verbose) {
    log = (tags, msg) => {
      server.log(tags, msg);
    };
  }

  // register any event types:
  if (Array.isArray(config.events)) {
    config.events.forEach(event => {
      server.event(event);
    });
    // log registered events:
    log(['hapi-confi', 'registered events'], config.events.join(','));
  }
  // register all plugins:
  const plugins = await require('./lib/plugins.js')(server, config, log, requireCwd);

  // register all views:
  require('./lib/views.js')(server, config, plugins, requireCwd, log);

  // register all asset routes:
  require('./lib/assets.js')(server, config, plugins, log);
  return { server, config };
};
