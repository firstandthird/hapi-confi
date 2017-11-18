/* eslint-disable no-underscore-dangle */
'use strict';
const confi = require('confi');
const async = require('async');
const path = require('path');
const aug = require('aug');
const util = require('util');

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
  // if (!options) {
  //   options = {};
  // }
  options = aug({}, options, defaults);
  options.configPath = options.configPath || `${cwd}/conf`;

  let _server = null;

  // load confi helpers:
  const helpers = {
    serverMethod(name) {
      return function(...args) {
        return _server.methods[name].apply(_server, args);
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

  // any 'beforeHooks':
  await require('./lib/beforeHook')(server, config, options);

  // register all plugins:
  const plugins = await require('./lib/plugins.js')(server, config, log, requireCwd);

  // register all views:
  await require('./lib/views.js')(server, config, plugins, requireCwd);
  log(['hapi-confi'], { message: 'views configured' });

  // register all asset routes:
  await require('./lib/assets.js')(server, config, plugins, log);

  return Promise.resolve({ server, config });
};
