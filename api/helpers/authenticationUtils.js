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

/**
 * Store the given API endpoint query as a timestamp in the
 * User Management Service with the given metadata.
 */
function addAPIQueryTimestamp(userId, _inputParams, _output) {
    let metadata = {
        output: _output,
        ..._inputParams
    };

    return new Promise((resolve, reject) => {
        
        // Making an API call at the User Management Service, passing in the metadata as the input body
        return axios.post(APIURLs.addAPIQueryTimestamp(userId), metadata)
        .then(res => {

            resolve(res.data);
        })
        .catch(err => {

            reject(err);
        });
    });
};

module.exports = {
    validateUserId: validateUserId,
    addAPIQueryTimestamp: addAPIQueryTimestamp
};