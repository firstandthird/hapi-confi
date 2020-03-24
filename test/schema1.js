const Joi = require('@hapi/joi');

module.exports = Joi.object({
  email: Joi.string().email().required(),
  createdOn: Joi.date().forbidden().default(Date.now)
});
