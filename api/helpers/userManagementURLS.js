/**
 * Wraps User Management Service API URLs that authenticationUtils
 * uses to build their API calls.
 */

const loc = { protocol: "http:", "hostname": "localhost" },
  PORT = 4000;

/**
 * API endpoint to ensure that the given user ID corresponds to
 * a valid SERaaS user account in the User Management Service.
 */
function validateUserId(userId) {
  return `${loc.protocol}//${loc.hostname}:${PORT}/authentication/validate/${userId}`
};

/**
 * API endpoint to store a SERaaS API query and its associated
 * metadata to the User Management Service.
 */
function addAPIQueryTimestamp(userId) {
  return `${loc.protocol}//${loc.hostname}:${PORT}/authentication/data/${userId}`;
};

module.exports = {
  validateUserId: validateUserId,
  addAPIQueryTimestamp: addAPIQueryTimestamp
};