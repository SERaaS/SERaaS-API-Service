/**
 * Wraps User Management Service API URLs that authenticationUtils
 * uses to build their API calls.
 * 
 * This is used as the URLs will change during usage in development
 * and production.
 */

/**
 * API endpoint to ensure that the given userId corresponds to
 * a valid SERaaS user account in the User Management Service.
 */
function validateUserId(userId) {
    return `http://localhost:4000/authentication/validate/${userId}`
};

/**
 * API endpoint to store a SERaaS API Query and its associated
 * metadata to the User Management Service.
 */
function addAPIQueryTimestamp() {
    `http://localhost:4000/authentication/data/${userId}`;
};

module.exports = {
    validateUserId: validateUserId,
    addAPIQueryTimestamp: addAPIQueryTimestamp
};