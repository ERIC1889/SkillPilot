const Joi = require('joi');

const setup = Joi.object({
  job: Joi.string().valid('고등학생', '대학생', '취업준비생', '직장인', '이직준비생', '기타').required(),
  grade: Joi.string().max(20).allow('', null),
  major: Joi.string().max(100).allow('', null),
  interest: Joi.string().max(255).allow('', null),
});

const update = Joi.object({
  job: Joi.string().valid('고등학생', '대학생', '취업준비생', '직장인', '이직준비생', '기타'),
  grade: Joi.string().max(20).allow('', null),
  major: Joi.string().max(100).allow('', null),
  interest: Joi.string().max(255).allow('', null),
}).min(1);

module.exports = { setup, update };
