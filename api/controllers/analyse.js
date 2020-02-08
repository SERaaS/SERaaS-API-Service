'use strict';

// Controllers for handling interaction between API endpoint and Speech Emotion Recognition (SER) system

const SER_MODEL_PATH = `${__dirname}/../models/classifier.joblib`;

const util = require('util'),
    fileHelpers = require('../helpers/fileConverter'),
    pythonRunner = require('../helpers/pythonRunner');

/**
 * Sends a hello world message back to the user to test the API.
 */
function analyseHelloWorld(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    var name = req.swagger.params.name.value || 'stranger';
    var hello = util.format('Hello, %s!', name);

    // this sends back a JSON response which is a single string
    res.json(hello);
}

/**
 * Send an audio file with speech and get the emotional statistics 
 * shown back (done via Support Vector Machine Classification)
 */
function analyseAll(req, res) {
    const _file = req.swagger.params.file.value;

    // Only accept one file at a time
    if (Array.isArray(_file)) {
        return res.status(400).send({
            errorCode: 400,
            message: 'Invalid file providied, API only supports one audio file at a time.'
        });
    }

    // Ensure given file is an audio file
    else if (!_file.mimetype.includes('audio')) {
        return res.status(400).send({
            errorCode: 400,
            message: 'Invalid file providied, not an audio file.'
        });
    };

    // Path to temporarily stored audio file for Python script to be performed on
    let customFilePath = null;

    // Writing into an audio file for the Python script to process
    return fileHelpers.write(_file.buffer)
    .then(_customFilePath => {
        customFilePath = _customFilePath;

        // Perform the SER via the Python script
        return pythonRunner.run(`${__dirname}/../models/demo.py`, [customFilePath, SER_MODEL_PATH])
        .then(_emotionalStatistics => {
            const emotionalStatistics = JSON.parse(_emotionalStatistics).data;
            let result = [];

            // Wrap result into the appropriate output schema
            // i.e. [{ emotion: '', probability: 0 }]
            emotionalStatistics.forEach(arr => {
                result.push({
                    emotion: arr[0],
                    probability: arr[1]
                });
            });

            // Audio file now redundant; removing the audio file to prevent it from taking storage space
            return fileHelpers.remove(customFilePath)
            .then(() => {

                // Send final output
                res.status(200).send({
                    emotions: result
                });
            })
        })
    })
    .catch(err => {
        // Error occurred, use console.log to find issue
        console.log(err);

        // Ensure the temporary file is removed
        if (customFilePath != null) {
            return fileHelpers.remove(customFilePath)
            .then(() => {

                res.status(400).send({
                    errorCode: 400,
                    message: err
                });
            })
        } else {
            res.status(400).send({
                errorCode: 400,
                message: err
            });
        };
    })
}

/**
 * Send an audio file with speech and get the most probable emotion 
 * shown back (done via Support Vector Machine Classification)
 * 
 * Demo API endpoint was a concept test for actual API endpoint
 */
/*
const DEMO_CODE_VALIDATION = 'Imicrowavecereal'
function analyseDemo(req, res) {
    const _file = req.swagger.params.file.value,
        _demoCode = req.swagger.params.demoCode.value;

    // Used to prevent spamming of invalid requests
    if (_demoCode != DEMO_CODE_VALIDATION) {
        return res.status(400).send({
            errorCode: 400,
            message: 'Invalid demo code validation string provided.'
        });
    }

    // Only accept one file at a time
    else if (Array.isArray(_file)) {
        return res.status(400).send({
            errorCode: 400,
            message: 'Invalid file providied, API only supports one audio file at a time.'
        });
    }

    // Ensure given file is an audio file
    else if (!_file.mimetype.includes('audio')) {
        return res.status(400).send({
            errorCode: 400,
            message: 'Invalid file providied, not an audio file.'
        });
    };

    // Path to temporarily stored audio file for Python script to be performed on
    let customFilePath = null;

    // Writing into an audio file for the Python script to process
    return fileHelpers.write(_file.buffer)
    .then(_customFilePath => {
        customFilePath = _customFilePath;

        // Perform the SER via the Python script
        return pythonRunner.run(`${__dirname}/../models/demo.py`, [customFilePath, SER_MODEL_PATH])
        .then(classification => {
            console.log(classification);

            // Audio file now redundant; removing the audio file to prevent it from taking storage space
            return fileHelpers.remove(customFilePath)
            .then(() => {

                // Send final output
                res.status(200).send({
                    emotion: classification
                });
            })
        })
    })
    .catch(err => {
        // Error occurred, use console.log to find issue
        console.log(err);

        // Ensure the temporary file is removed
        if (customFilePath != null) {
            return fileHelpers.remove(customFilePath)
            .then(() => {

                res.status(400).send({
                    errorCode: 400,
                    message: err
                });
            })
        } else {
            res.status(400).send({
                errorCode: 400,
                message: err
            });
        };
    })
}
*/

module.exports = {
    analyse: analyseHelloWorld,
    analyseAll: analyseAll
    // analyseDemo: analyseDemo
}