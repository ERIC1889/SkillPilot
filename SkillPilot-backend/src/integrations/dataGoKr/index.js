const client = require('./client');
const endpointsModule = require('./endpoints');
const itFilter = require('./itFilter');
const normalize = require('./normalize');

module.exports = {
  client,
  endpoints: endpointsModule,
  hasAnyKey: endpointsModule.hasAnyKey,
  resolveKey: endpointsModule.resolveKey,
  ...itFilter,
  ...normalize,
};
