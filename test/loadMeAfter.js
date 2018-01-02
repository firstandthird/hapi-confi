const register = (server, options) => {
  server.settings.app.order = 'after';
};

exports.plugin = {
  name: 'loadMeAfter',
  register,
  once: true,
  pkg: require('../package.json')
};
