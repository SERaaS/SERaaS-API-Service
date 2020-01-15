'use strict';

// Controller for handling interaction between API endpoint and SER system

const util = require('util');

function analyse(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    var name = req.swagger.params.name.value || 'stranger';
    var hello = util.format('Hello, %s!', name);

    // this sends back a JSON response which is a single string
    res.json(hello);
}

module.exports = {
    analyse: analyse
}