const _ = require('lodash');

module.exports = async (server, config, log, requireCwd) => {
  if (!config.plugins) {
    return;
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
  pluginArr = _.sortBy(pluginArr, '_priority');
  pluginArr.forEach(async (plugin) => {
    const name = plugin._name;
    delete plugin._name;
    delete plugin._enabled;
    delete plugin._priority;
    log(['hapi-confi'], { message: 'plugin loaded', plugin: name, options: plugin });
    await server.register({
      plugin: requireCwd(name),
      options: plugin
    });
  });
};
