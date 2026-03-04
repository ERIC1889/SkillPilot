const Joi = require('joi');

const submit = Joi.object({
  certificationId: Joi.number().integer().required(),
  answers: Joi.array().items(Joi.object({
    questionId: Joi.string().required(),
    selectedIndex: Joi.number().integer().min(0).max(3).required(),
  })).min(1).required(),
});

module.exports = { submit };
