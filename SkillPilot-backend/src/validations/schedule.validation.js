const Joi = require('joi');

const create = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  goal: Joi.string().max(255).allow('', null),
  amount: Joi.string().max(100).allow('', null),
  event: Joi.string().max(255).allow('', null),
  status: Joi.string().valid('예정', '완료', '취소'),
});

const update = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  goal: Joi.string().max(255).allow('', null),
  amount: Joi.string().max(100).allow('', null),
  event: Joi.string().max(255).allow('', null),
  status: Joi.string().valid('예정', '완료', '취소'),
}).min(1);

module.exports = { create, update };
