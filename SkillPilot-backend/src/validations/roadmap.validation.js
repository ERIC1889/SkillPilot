const Joi = require('joi');

const generate = Joi.object({
  certificationId: Joi.number().integer().required(),
  priority: Joi.string().allow('', null),
});

const reorder = Joi.object({
  weekOrder: Joi.array().items(Joi.string()).required(),
});

const addWeek = Joi.object({
  title: Joi.string().required(),
  goal: Joi.string().allow('', null),
  time: Joi.string().allow('', null),
  materials: Joi.array().items(Joi.string()),
});

const updateWeek = Joi.object({
  title: Joi.string(),
  goal: Joi.string().allow('', null),
  time: Joi.string().allow('', null),
  materials: Joi.array().items(Joi.string()),
}).min(1);

const updatePriority = Joi.object({
  certificationId: Joi.number().integer().required(),
  priority: Joi.string().required(),
});

module.exports = { generate, reorder, addWeek, updateWeek, updatePriority };
