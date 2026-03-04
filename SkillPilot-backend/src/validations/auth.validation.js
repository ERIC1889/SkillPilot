const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().min(2).max(50).required()
    .messages({ 'any.required': '이름은 필수입니다' }),
  email: Joi.string().email().required()
    .messages({ 'any.required': '이메일은 필수입니다' }),
  password: Joi.string().min(6).max(100).required()
    .messages({ 'any.required': '비밀번호는 필수입니다' }),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { register, login };
