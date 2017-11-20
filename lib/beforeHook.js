module.exports = async(server, config, options) => {
  if (typeof options.before !== 'function') {
    return;
  }
  return await options.before(server, config);
};
