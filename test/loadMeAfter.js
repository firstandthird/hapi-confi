const register = (server, options) => {
  server.settings.app.order.push(3);
};

exports.plugin = {
  name: 'loadMeAfter',
  register,
  once: true,
  pkg: require('../package.json')
};
