/**
 * Wraps User Management Service API calls to perform authentication
 * functionalities for the service.
 */

const axios = require('axios'),

  // User Management Service' API Endpoint URLs
  APIURLs = require('./userManagementURLS');

/**
 * Ensure that the given user ID in the API endpoint corresponds to
 * a valid SERaaS user account in the User Management Service.
 */
function validateUserId(userId) {
  return new Promise(function(resolve, reject) {

    // Making an API call at the User Management Service
    return axios.get(APIURLs.validateUserId(userId))
    .then(function(res) {

      // userExists indicates whether the user ID corresponds with an actual user
      resolve(res.data.userExists)
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

/**
 * Store the given API endpoint call as a Timestamp in the
 * User Management Service with the given metadata.
 */
function addAPIQueryTimestamp(userId, _inputParams, _output) {
  let metadata = {
    output: _output,
    ..._inputParams
  };

  return new Promise(function(resolve, reject) {
    
    // Making an API call at the User Management Service, passing in the metadata as the input body
    return axios.post(APIURLs.addAPIQueryTimestamp(userId), metadata)
    .then(function(res) {
      resolve(res.data);
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

module.exports = {
  validateUserId: validateUserId,
  addAPIQueryTimestamp: addAPIQueryTimestamp
};