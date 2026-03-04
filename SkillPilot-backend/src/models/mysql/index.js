const sequelize = require('../../config/mysql');

const User = require('./User');
const Profile = require('./Profile');
const Goal = require('./Goal');
const Certification = require('./Certification');
const UserCertification = require('./UserCertification');
const Schedule = require('./Schedule');
const ExamSchedule = require('./ExamSchedule');
const Notice = require('./Notice');
const Portfolio = require('./Portfolio');
const PortfolioSkill = require('./PortfolioSkill');
const PortfolioCert = require('./PortfolioCert');
const PortfolioProject = require('./PortfolioProject');
const PortfolioLink = require('./PortfolioLink');
const PortfolioActivity = require('./PortfolioActivity');

// User <-> Profile (1:1)
User.hasOne(Profile, { foreignKey: 'user_id', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Goal (1:1)
User.hasOne(Goal, { foreignKey: 'user_id', as: 'goal' });
Goal.belongsTo(User, { foreignKey: 'user_id' });

// User <-> UserCertification (1:N)
User.hasMany(UserCertification, { foreignKey: 'user_id', as: 'userCertifications' });
UserCertification.belongsTo(User, { foreignKey: 'user_id' });

// Certification <-> UserCertification (1:N)
Certification.hasMany(UserCertification, { foreignKey: 'certification_id', as: 'userCertifications' });
UserCertification.belongsTo(Certification, { foreignKey: 'certification_id', as: 'certification' });

// User <-> Schedule (1:N)
User.hasMany(Schedule, { foreignKey: 'user_id', as: 'schedules' });
Schedule.belongsTo(User, { foreignKey: 'user_id' });

// Certification <-> ExamSchedule (1:N)
Certification.hasMany(ExamSchedule, { foreignKey: 'certification_id', as: 'examSchedules' });
ExamSchedule.belongsTo(Certification, { foreignKey: 'certification_id' });

// User <-> Portfolio (1:1)
User.hasOne(Portfolio, { foreignKey: 'user_id', as: 'portfolio' });
Portfolio.belongsTo(User, { foreignKey: 'user_id' });

// Portfolio <-> sub-tables (1:N)
Portfolio.hasMany(PortfolioSkill, { foreignKey: 'portfolio_id', as: 'skills' });
PortfolioSkill.belongsTo(Portfolio, { foreignKey: 'portfolio_id' });

Portfolio.hasMany(PortfolioCert, { foreignKey: 'portfolio_id', as: 'certs' });
PortfolioCert.belongsTo(Portfolio, { foreignKey: 'portfolio_id' });

Portfolio.hasMany(PortfolioProject, { foreignKey: 'portfolio_id', as: 'projects' });
PortfolioProject.belongsTo(Portfolio, { foreignKey: 'portfolio_id' });

Portfolio.hasMany(PortfolioLink, { foreignKey: 'portfolio_id', as: 'links' });
PortfolioLink.belongsTo(Portfolio, { foreignKey: 'portfolio_id' });

Portfolio.hasMany(PortfolioActivity, { foreignKey: 'portfolio_id', as: 'activities' });
PortfolioActivity.belongsTo(Portfolio, { foreignKey: 'portfolio_id' });

module.exports = {
  sequelize,
  User,
  Profile,
  Goal,
  Certification,
  UserCertification,
  Schedule,
  ExamSchedule,
  Notice,
  Portfolio,
  PortfolioSkill,
  PortfolioCert,
  PortfolioProject,
  PortfolioLink,
  PortfolioActivity,
};
