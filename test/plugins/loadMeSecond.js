const register = (server, options) => {
  server.settings.app.order.push(2);
};

exports.plugin = {
  name: 'loadMeSecond',
  register,
  once: true,
  pkg: require('../../package.json')
};
