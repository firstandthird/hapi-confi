exports.test = {
  method: 'GET',
  path: '/getFile',
  handler: (request, reply) => {
    // this will only work if the inert dependency was already loaded:
    reply.file('/test/routes/route.js');
  }
};
