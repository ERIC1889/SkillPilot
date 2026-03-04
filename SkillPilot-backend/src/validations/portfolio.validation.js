const Joi = require('joi');

const updateIntro = Joi.object({
  name: Joi.string().max(50).allow('', null),
  role: Joi.string().max(100).allow('', null),
  bio: Joi.string().allow('', null),
});

const addSkill = Joi.object({
  skill_name: Joi.string().max(100).required(),
});

const addCert = Joi.object({
  cert_name: Joi.string().max(100).required(),
  year: Joi.string().max(10).allow('', null),
});

const addProject = Joi.object({
  title: Joi.string().max(200).required(),
  tag: Joi.string().max(100).allow('', null),
  description: Joi.string().allow('', null),
});

const updateProject = Joi.object({
  title: Joi.string().max(200),
  tag: Joi.string().max(100).allow('', null),
  description: Joi.string().allow('', null),
}).min(1);

const updateLinks = Joi.object({
  links: Joi.array().items(Joi.object({
    label: Joi.string().max(100).required(),
    url: Joi.string().max(500).required(),
  })).required(),
});

const addActivity = Joi.object({
  title: Joi.string().max(200).required(),
  year: Joi.string().max(10).allow('', null),
  type: Joi.string().valid('대외활동', '봉사활동', '수상', '교육', '기타'),
});

const updateActivity = Joi.object({
  title: Joi.string().max(200),
  year: Joi.string().max(10).allow('', null),
  type: Joi.string().valid('대외활동', '봉사활동', '수상', '교육', '기타'),
}).min(1);

const updateEtc = Joi.object({
  etc_content: Joi.string().allow('', null),
});

module.exports = {
  updateIntro,
  addSkill,
  addCert,
  addProject,
  updateProject,
  updateLinks,
  addActivity,
  updateActivity,
  updateEtc,
};
