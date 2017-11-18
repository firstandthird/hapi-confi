module.exports = (server, config, plugins, log) => {
  const assetConfig = config.assets;
  if (!assetConfig || !assetConfig.endpoint) {
    return;
  }
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
};
