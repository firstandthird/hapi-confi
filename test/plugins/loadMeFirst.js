const register = (server, options) => {
  server.settings.app.order.push(1);
};

exports.plugin = {
  name: 'loadMeFirst',
  register,
  once: true,
  pkg: require('../../package.json')
};
