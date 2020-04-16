'use strict';

// Controllers for handling interaction between API endpoint and Speech Emotion Recognition (SER) system

const util = require('util'),
  fileHelpers = require('../helpers/fileHelpers'),
  predictSERWrapper = require('../helpers/predictSERWrapper'),
  authentication = require('../helpers/authenticationUtils'),
  AVAILABLE_EMOTIONS = require('../helpers/availableEmotions');

// Used to check if User IDs are valid User Management Service IDs (Hexadecimal strings)
const hexadecimalString = /^[a-fA-F0-9]{24}$/;

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
 * Helper function to perform the SER based on the given file path and
 * removing it after the operation.
 */
function getEmotionalStatistics(filePath, showAllEmotions, emotionsToAnalyse) {

  // Perform the SER via the Python script
  return predictSERWrapper.speechEmotionRecognition(filePath)
  .then(emotionalStatistics => {

    // Audio file now redundant; removing the audio file to prevent it from taking storage space
    return fileHelpers.removeTemporaryFile(filePath)
    .then(() => {
      let emotions = [];

      // Wrap result into the appropriate output schema
      // i.e. [{ emotion: '', probability: 0 }]
      emotionalStatistics.forEach(arr => {
        const _emotion = arr[0];

        if (showAllEmotions || emotionsToAnalyse.includes(_emotion)) {
          emotions.push({
            emotion: _emotion,
            probability: arr[1]
          });
        };
      });

      // Return final output
      return emotions;
    })
  })
};

/**
 * Send an audio file with speech and get the emotional statistics 
 * shown back (done via Support Vector Machine Classification)
 */
function analyseAll(req, res) {
  const _userId = req.swagger.params.userId.value,
    _emotionsToAnalyse = req.swagger.params.emotions.value,
    _file = req.swagger.params.file.value;

  // Input metadata related to the API query to be stored in the User Management Service
  let inputMetadata = {};
  
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

  inputMetadata.fileName = _file.originalname;

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

    inputMetadata.paramEmotionsAvailable = emotionsToAnalyse;
  }

  // Periodic length should be greater than 0
  else if (_period !== undefined && (isNaN(_period) || _period <= 0)) {
    return res.status(400).send({
      errorCode: 400,
      message: 'Invalid periodic length provided, should be greater than 0.'
    });
  };

  if (_period) {
    inputMetadata.paramPeriodicQuery = _period;
  }

  // User ID should be a valid hexadecimal string from the User Management Service
  if (!hexadecimalString.test(_userId)) {
    return res.status(401).send({
      errorCode: 401,
      message: 'Invalid user ID provided, should be a valid hexadecimal string.'
    });
  };

  // Path to temporarily stored audio file for Python script to be performed on
  let customFilePaths = null;

  // Ensuring the given user ID corresponds to a registered user in the User Management Service
  return authentication.validateUserId(_userId)
  .then(userExists => {

    if (!userExists) {
      return res.status(401).send({
        errorCode: 401,
        message: 'Invalid user ID provided, should correspond to a registered user.'
      });
    }

    // Writing into an audio file for the Python script to process
    return fileHelpers.audioFileConversion(_file.buffer)
    .then(mainFilePath => {
      customFilePaths = [mainFilePath];

      if (!_period) {

        // Normal query => Simply do SER process on the entire file
        // Helper function above handles all the logic to execute the SER
        return getEmotionalStatistics(mainFilePath, showAllEmotions, emotionsToAnalyse)
        .then(_emotions => {

          // Store the entire API query's aggregated metadata in the User Management Service before outputting result
          return authentication.addAPIQueryTimestamp(_userId, inputMetadata, _emotions)
          .then()
          .catch()
          .then(() => {
            // Send final output regardless of error within User Management Service
            // This is because metadata storage is not a critical operation

            res.status(200).send({
              emotions: _emotions
            });
          });
        });
      } else {

        // Periodic querying => Break into multiple files and process at a time
        // Break the main file into multiple ones based on the given [_period] duration
        return fileHelpers.splitAudioFile(mainFilePath, _period)
        .then(newFilePaths => {
          let result = [],
            promises = [];
    
          // Storing all file paths created for deletion incase of failure
          customFilePaths = customFilePaths.concat(newFilePaths);

          // For each file; 1. Perform SER, 2. Remove file and 3. Wrap result
          newFilePaths.forEach((filePath, thisPathIndex) => {
            promises.push(

              // 1. & 2.
              getEmotionalStatistics(filePath, showAllEmotions, emotionsToAnalyse)
              .then(emotions => {
                emotions.forEach(emotionObj => {

                  // 3.
                  // [{ emotion: '', probability: 0, duration: { from: '00:00', to: '00:00' } }]
                  result.push({
                    emotion: emotionObj.emotion,
                    probability: emotionObj.probability,

                    // Add metadata for the duration of the file being analysed
                    duration: {
                      from: convertToMinutesSeconds(thisPathIndex * _period),
                      to: convertToMinutesSeconds((thisPathIndex + 1) * _period)
                    }
                  })
                })
              })
            );
          });

          // Execute the SER operations all at once and afterwards;
          return Promise.all(promises)
          .then(() => {

            // Remove the main audio file as it is now redundant after all operations performed.
            return fileHelpers.removeTemporaryFile(mainFilePath)
            .then(() => {

              // Ensure the output is sorted based on duration of audio analysed
              result = result.sort((a, b) => a.duration.from > b.duration.from);

              // Store the entire API query's aggregated metadata in the User Management Service before outputting result
              return authentication.addAPIQueryTimestamp(_userId, inputMetadata, result)
              .then(() => {})
              .catch(() => {})
              .then(() => {
                // Send final output regardless of error within User Management Service
                // This is because metadata storage is not a critical operation

                res.status(200).send({
                  emotions: result
                });
              });
            });
          })
        });
      };
    })
  })
  .catch(err => {
    // Error occurred, use console.log to find issue
    console.log(err);

    // Ensure the temporary files are all removed
    if (customFilePaths != null) {
      let promises = [];

      customFilePaths.forEach(filePath => {
        promises.push(
          fileHelpers.removeTemporaryFile(filePath)
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
        message: String(err)
      });
    };
  })
}

module.exports = {
  analyseAll: analyseAll
}