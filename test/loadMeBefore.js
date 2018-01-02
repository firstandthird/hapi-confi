const register = (server, options) => {
  server.settings.app.order = 'before';
};

exports.plugin = {
  name: 'loadMeBefore',
  register,
  once: true,
  pkg: require('../package.json')
};
