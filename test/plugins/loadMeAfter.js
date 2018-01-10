const register = (server, options) => {
  server.settings.app.order.push('last');
};

exports.plugin = {
  name: 'loadMeAfter',
  register,
  once: true,
  pkg: require('../../package.json')
};
