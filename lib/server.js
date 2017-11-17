const aug = require('aug');

module.exports = async(Hapi, config, options, requireCwd) => {
  const serverConfig = aug(config.server || {});
  // do we need this?
  // const connection = config.connection || {};
  if (serverConfig.cache) {
    if (serverConfig.cache.enabled === false) {
      // remove cache if not being used to avoid hapi errors:
      delete serverConfig.cache;
    } else {
      serverConfig.cache.engine = requireCwd(serverConfig.cache.engine);
    }
  }
  if (process.env.PORT) {
    serverConfig.port = process.env.PORT;
  }
  const server = new Hapi.Server(serverConfig);
  server.settings.app = config;
  return server;
};
