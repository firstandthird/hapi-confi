const aug = require('aug');
const cwd = process.cwd();
const _ = require('lodash');

module.exports = (server, config, plugins, requireCwd) => {
  if (!config.views) {
    return;
  }
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
};
