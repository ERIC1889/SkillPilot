const Joi = require('joi');

const createOrUpdate = Joi.object({
  tech_stack: Joi.string().max(500).allow('', null),
  target_roles: Joi.array().items(Joi.string()),
  custom_role: Joi.string().max(100).allow('', null),
  period: Joi.string().max(50).allow('', null),
});

module.exports = { createOrUpdate };
