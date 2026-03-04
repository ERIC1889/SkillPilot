const Joi = require('joi');

const select = Joi.object({
  certificationIds: Joi.array().items(Joi.number().integer()).min(1).required(),
});

module.exports = { select };
