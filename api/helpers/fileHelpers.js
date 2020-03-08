/**
 * Helpers to manipulate audio files, to assist in performing Speech Emotion Recognition
 * for an input file buffer.
 */

const fs = require('fs').promises,
  uuid = require('uuid/v1'),

  // Utilities for executing native Terminal commands
  util = require('util'),
  exec = util.promisify(require('child_process').exec);

/**
 * Handles conversion of a file buffer to an audio .wav file, to allow Python 
 * scripts to process each audio file input.
 */
function audioFileConversion(fileBuffer) {
  return new Promise(function(resolve, reject) {

    const customFilePath = `./tmp/${uuid()}.wav`

    fs.writeFile(customFilePath, fileBuffer)
    .then(function() {
      resolve(customFilePath);
    })
    .catch(function(err) {
      reject(err);
    });
  });
}

/**
 * Splits the given audio file into multiple ones based on the given
 * duration desired for each file (in seconds).
 */
function splitAudioFile(filePath, durationPerFile) {
  const fileType = filePath.slice(-4),
    _filePath = filePath.slice(0, -4); // Without the file type

  return new Promise(function(resolve, reject) {

    // Using the ffmpeg library to split the file (hosting service should have it pre-installed)
    exec(`ffmpeg -i ${filePath} -f segment -segment_time ${durationPerFile} -c copy ${_filePath}%04d${fileType} -hide_banner`)
    .then(function(res) {

      // Retrieving the resulting file paths via [filePath]0000[fileType]
      // e.g. speech0001.wav -> match
      let out = res.stderr.match(new RegExp(`${_filePath}\\d{4}${fileType}`, 'g'));
      resolve(out);
    })
    .catch(function(err) {
      reject(err);
    })
  });
};

/**
 * Removes an existing tmp/ file after being created.
 */
function removeTemporaryFile(filePath) {
  return new Promise(function(resolve, reject) {

    fs.unlink(filePath)
    .then(function() {
      resolve(filePath);
    })
    .catch(function(err) {
      reject(err);
    })
  })
}

module.exports = {
	audioFileConversion: audioFileConversion,
	removeTemporaryFile: removeTemporaryFile,
	splitAudioFile: splitAudioFile
};