const { Notice } = require('../models/mysql');

const list = async ({ type, limit = 20 } = {}) => {
  const where = {};
  if (type) where.type = type;
  return Notice.findAll({
    where,
    order: [['published_at', 'DESC'], ['createdAt', 'DESC']],
    limit: Number(limit),
  });
};

const create = async (data) => Notice.create(data);

const remove = async (id) => Notice.destroy({ where: { id } });

module.exports = { list, create, remove };
