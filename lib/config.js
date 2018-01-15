const util = require('util');
const confi = require('confi');
module.exports = async (options, helpers) => {
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
  try {
    const config = await confi(confiOptions);
    if (config.verbose === true) {
      options.verbose = true;
    }
    if (process.env.DEBUG_CONFI) {
      console.log(JSON.stringify(config, null, ' '));
    }
    return config;
  } catch (e) {
    return e;
  }
};
