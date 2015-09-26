var hapiConfi = require('../');
var Hapi = require('hapi');

var options = {
  configPath: __dirname + '/conf'

};
hapiConfi(Hapi, options, function(err, server, config) {

  server.route({
    path: '/',
    method: 'get',
    handler: function(request, reply) {
      reply('ok');
    }
  });
  server.start(function(err) {
    if (err) {
      throw err;
    }

    server.log(['server', 'info'], 'Server started '+ server.info.uri);
  });

});
