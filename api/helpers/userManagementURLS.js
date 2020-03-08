/**
 * Wraps User Management Service API URLs that authenticationUtils
 * uses to build their API calls.
 * 
 * This is used as the URLs will change during usage in development
 * and production.
 */

const PORT = 4000;

/**
 * API endpoint to ensure that the given user ID corresponds to
 * a valid SERaaS user account in the User Management Service.
 */
function validateUserId(userId) {
  return `http://localhost:${PORT}/authentication/validate/${userId}`
};

/**
 * API endpoint to store a SERaaS API query and its associated
 * metadata to the User Management Service.
 */
function addAPIQueryTimestamp(userId) {
  return `http://localhost:${PORT}/authentication/data/${userId}`;
};

module.exports = {
  validateUserId: validateUserId,
  addAPIQueryTimestamp: addAPIQueryTimestamp
};