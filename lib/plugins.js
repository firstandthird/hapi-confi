const Deptree = require('deptree');
const path = require('path');

module.exports = async (server, config, log, requireCwd) => {
  if (!config.plugins) {
    return;
  }
  let pluginArr = [];
  Object.keys(config.plugins).forEach((key) => {
    let value = config.plugins[key];
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
  // use deptree to resolve the order in which the plugins load
  // based on their _dependencies:
  const deptree = new Deptree();
  // use these to guarantee all deps are present:
  let dependencies = [];
  const names = [];
  pluginArr.forEach((plugin) => {
    // priority is deprecated:
    if (plugin._priority) {
      throw new Error(`"_priority" field used by ${plugin._name} is deprecated, please migrate your plugins to use the _dependencies format`);
    }
    if (plugin._dependencies) {
      dependencies = dependencies.concat(plugin._dependencies);
    }
    names.push(plugin._name);
    deptree.add(plugin._name, plugin._dependencies ? plugin._dependencies : []);
  });
  // ensure all dependencies exist:
  for (let i = 0; i < dependencies.length; i++) {
    if (!names.includes(dependencies[i])) {
      throw new Error(`Missing plugin dependency ${dependencies[i]}`);
    }
  }
  pluginArr = deptree.resolve().reduce((memo, pluginName) => {
    for (let i = 0; i < pluginArr.length; i++) {
      const plugin = pluginArr[i];
      if (pluginName === plugin._name) {
        memo.push(plugin);
        return memo;
      }
    }
    return memo;
  }, []);

  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < pluginArr.length; i++) {
    const plugin = pluginArr[i];
    const name = plugin._name;
    delete plugin._name;
    delete plugin._enabled;
    delete plugin._priority;
    await server.register({
      plugin: requireCwd(name),
      options: plugin
    });
    log(['hapi-confi', 'plugin'], `${name} plugin loaded`);
  }
  /* eslint-enable no-await-in-loop */
};
