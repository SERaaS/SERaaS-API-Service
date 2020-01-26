const fs = require('fs').promises,
    uuid = require('uuid/v1');

/**
 * Handles conversion of a file buffer to an audio .wav file, to allow Python 
 * scripts to process each audio file input.
 */
function audioFileConversion(fileBuffer) {
    return new Promise((resolve, reject) => {
        const customFilePath = `./tmp/${uuid()}.wav`

        fs.writeFile(customFilePath, fileBuffer)
        .then(() => {
            resolve(customFilePath);
        })
        .catch(err => {
            reject(err);
        });
    });
}

/**
 * Removes an existing tmp/ file after being created.
 */
function removeTemporaryFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath)
        .then(() => {
            resolve(filePath);
        })
        .catch(err => {
            reject(err);
        })
    })
}

module.exports = {
    write: audioFileConversion,
    remove: removeTemporaryFile
};