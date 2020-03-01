/**
 * Wraps User Management Service API calls to perform authentication
 * functionalities for the service.
 */

const axios = require('axios'),

    // User Management Service' API Endpoint URLs
    APIURLs = require('./userManagementURLS');

/**
 * Ensure that the given userId in the API endpoint corresponds to
 * a valid SERaaS user account in the User Management Service.
 */
function validateUserId(userId) {
    return new Promise((resolve, reject) => {

        // Making an API call at the User Management Service
        return axios.get(APIURLs.validateUserId(userId))
        .then(res => {

            // userExists indicates whether the user ID corresponds with an actual user
            resolve(res.data.userExists)
        })
        .catch(err => {
            reject(err);
        });
    });
};

module.exports = {
    validateUserId: validateUserId
};