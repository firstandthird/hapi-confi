const aug = require('aug');

module.exports = (server, config, plugins, requireCwd) => {
  if (!config.views) {
    return;
  }
  const views = aug(config.views);
  Object.keys(views.engines).forEach((ext) => {
    const engine = views.engines[ext];
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
};
