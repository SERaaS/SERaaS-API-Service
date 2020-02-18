'use strict';

// Controllers for handling interaction between API endpoint and Speech Emotion Recognition (SER) system

const SER_MODEL_PATH = `${__dirname}/../models/classifier.joblib`;

const util = require('util'),
    fileHelpers = require('../helpers/fileConverter'),
    pythonRunner = require('../helpers/pythonRunner'),
    AVAILABLE_EMOTIONS = require('../helpers/availableEmotions');

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
 * Helper function to convert seconds into a readable minutes and seconds string.
 * e.g. 60 -> 01:00
 */
function convertToMinutesSeconds(_secs) {
    const mins = Math.floor(_secs / 60),
        secs = _secs - mins * 60;

    return String(`${mins >= 10 ? mins : '0' + mins}:${secs >= 10 ? secs : '0' + secs}`);
};

/**
 * Send an audio file with speech and get the emotional statistics 
 * shown back (done via Support Vector Machine Classification)
 */
function analyseAll(req, res) {
    const _emotionsToAnalyse = req.swagger.params.emotions.value,
        _file = req.swagger.params.file.value;
    
    // Checking if it is a periodic query or not
    // Analyse the audio file in [_period] second chunks if it is
    let _period = req.swagger.params.period || false;
    _period = _period ? _period.value : false;

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
            message: 'Invalid file provided, not an audio file.'
        });
    };

    // Limit emotional statistics output based on query
    // If not querying all, separate by comma for queried emotions
    // i.e. happy,sad -> ['happy', 'sad']
    const showAllEmotions = _emotionsToAnalyse === 'all';
    let emotionsToAnalyse = showAllEmotions ? [] : _emotionsToAnalyse.split(',');

    if (!showAllEmotions) {
        // Ensure some valid emotion query parameters exist
        emotionsToAnalyse = emotionsToAnalyse.filter(emotion => {
            return AVAILABLE_EMOTIONS.includes(emotion);
        });

        if (emotionsToAnalyse.length < 1) {
            return res.status(400).send({
                errorCode: 400,
                message: 'Invalid query emotions provided, they do not exist.'
            });
        };
    }

    // Periodic length should be greater than 0
    else if (_period && (isNaN(_period) || _period <= 0)) {
        return res.status(400).send({
            errorCode: 400,
            message: 'Invalid periodic length provided, should be greater than 0.'
        });
    };

    // Path to temporarily stored audio file for Python script to be performed on
    let customFilePaths = null;

    // Writing into an audio file for the Python script to process
    return fileHelpers.write(_file.buffer)
    .then(mainFilePath => {
        customFilePaths = [mainFilePath];

        if (!_period) {

            // Non-periodic query => Process the one file
            // Perform the SER via the Python script
            return pythonRunner.run(`${__dirname}/../models/demo.py`, [mainFilePath, SER_MODEL_PATH])
            .then(_emotionalStatistics => {
                const emotionalStatistics = JSON.parse(_emotionalStatistics).data;

                // Audio file now redundant; removing the audio file to prevent it from taking storage space
                return fileHelpers.remove(mainFilePath)
                .then(() => {
                    let result = [];
        
                    // Wrap result into the appropriate output schema
                    // i.e. [{ emotion: '', probability: 0 }]
                    emotionalStatistics.forEach(arr => {
                        const _emotion = arr[0];
        
                        if (showAllEmotions || emotionsToAnalyse.includes(_emotion)) {
                            result.push({
                                emotion: _emotion,
                                probability: arr[1]
                            });
                        };
                    });

                    // Send final output
                    res.status(200).send({
                        emotions: result
                    });
                })
            })
        } else {

            // Periodic querying => Break into multiple files and process at a time
            // Break the main file into multiple ones based on the given _period duration
            return fileHelpers.split(mainFilePath, _period)
            .then(newFilePaths => {
                let result = [],
                    promises = [];
    
                customFilePaths = customFilePaths.concat(newFilePaths);

                // For each file; 1. Perform SER, 2. Remove file and 3. Wrap result
                newFilePaths.forEach((filePath, thisPathIndex) => {
                    promises.push(
                        // 1.
                        pythonRunner.run(`${__dirname}/../models/demo.py`, [filePath, SER_MODEL_PATH])
                        .then(_emotionalStatistics => {
                            const emotionalStatistics = JSON.parse(_emotionalStatistics).data;

                            // 2.
                            return fileHelpers.remove(filePath)
                            .then(() => {

                                // 3.
                                // i.e. [{ emotion: '', probability: 0, duration: { from: '00:00', to: '00:00' } }]
                                emotionalStatistics.forEach(arr => {
                                    const _emotion = arr[0];
                    
                                    if (showAllEmotions || emotionsToAnalyse.includes(_emotion)) {
                                        result.push({
                                            emotion: _emotion,
                                            probability: arr[1],

                                            // The duration of the file being analysed
                                            duration: {
                                                from: convertToMinutesSeconds(thisPathIndex * _period),
                                                to: convertToMinutesSeconds((thisPathIndex + 1) * _period)
                                            }
                                        });
                                    };
                                });
                            })
                        })
                    );
                });

                return Promise.all(promises)
                .then(() => {

                    // Main audio file now redundant after all operations performed.
                    return fileHelpers.remove(mainFilePath)
                    .then(() => {

                        // Ensure the output is sorted based on duration of audio analysed
                        result = result.sort((a, b) => a.duration.from > b.duration.from);

                        // Send final output
                        res.status(200).send({
                            emotions: result
                        });
                    });
                })
            });
        };
    })
    .catch(err => {
        // Error occurred, use console.log to find issue
        console.log(err);

        // Ensure the temporary files are all removed
        if (customFilePaths != null) {
            let promises = [];

            customFilePaths.forEach(filePath => {
                promises.push(
                    fileHelpers.remove(filePath)
                );
            });

            return Promise.all(promises)
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