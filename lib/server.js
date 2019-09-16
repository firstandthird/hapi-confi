const aug = require('aug');

module.exports = (Hapi, config, options, requireCwd) => {
  const serverConfig = aug(config.server || {});
  if (serverConfig.cache) {
    if (serverConfig.cache.enabled === false) {
      // remove cache if not being used to avoid hapi errors:
      delete serverConfig.cache;
    } else {
      serverConfig.cache.provider.constructor = requireCwd(serverConfig.cache.provider.constructor);
      if (options.verbose) {
        console.log(`cache enabled on this server, provider is "${serverConfig.cache.name}"`);
      }
    }
  }
  if (options.usePortEnv) {
    serverConfig.port = process.env.PORT;
  }
  const server = new Hapi.Server(serverConfig);
  server.settings.app = config;
  return server;
};
