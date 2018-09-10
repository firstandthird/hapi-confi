const aug = require('aug');

module.exports = (server, config, plugins, requireCwd, log) => {
  if (!config.views) {
    return;
  }
  const views = aug(config.views);
  Object.keys(views.engines).forEach((ext) => {
    const engine = views.engines[ext];
    if (typeof engine === 'string') {
      log(['hapi-confi'], `configuring view engine ${engine}`);
      views.engines[ext] = requireCwd(engine);
    }
  });
  if (!views.context) {
    views.context = {};
  }
  if (config.routePrefix) {
    views.context.routePrefix = config.routePrefix;
    log(['hapi-confi'], `routePrefix for views is set to ${config.routePrefix}`);
  }
  server.views(views);
  log(['hapi-confi'], { message: 'views configured' });
};
