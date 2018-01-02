const register = (server, options) => {
  server.settings.app.order = [1];
};

exports.plugin = {
  name: 'loadMeFirst',
  register,
  once: true,
  pkg: require('../package.json')
};
