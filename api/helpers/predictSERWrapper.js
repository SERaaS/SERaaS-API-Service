/**
 * Wraps the execution of the Speech Emotion Recognition classification script in Python
 * at '../models/predictSER.py' and its functionality in this file, for easy integration
 * with Node code.
 */

const SER_SCRIPT_PATH = `${__dirname}/../models/predictSER.py`,
	SER_MODEL_PATH = `${__dirname}/../models/classifier.joblib`;

const { spawn } = require('child_process');

/**
 * Helper function for running a Python file via Node. Modularised as it may be useful for 
 * future requirements.
 */
function pythonRunner(scriptPath, args=[]) {
  return new Promise(function(resolve, reject) {

		// Hosting service and terminal should have Python pre-installed to use this
    const program = spawn('python',  [scriptPath].concat(args));

    program.stdout.on('data', function(data) {
      resolve(data.toString());
    });

    program.stderr.on('data', function(data) {
      reject(data.toString());
    })
  });
};

/**
 * Performs the SER classification using the Python script defined above.
 * 
 * Outputs the results as an array of arrays
 * e.g. [[emotion, probabilityOfEmotion], [emotion, probabilityOfEmotion], ...]
 */
function speechEmotionRecognition(filePath, emotionsToAnalyse) {

  // Dynamically selecting the model to use for performing SER based on the emotions to analyse / compare.
  const modelPath = `${__dirname}/../models/classifiers/${emotionsToAnalyse.sort().join(',')}.joblib`;

	return pythonRunner(SER_SCRIPT_PATH, [filePath, modelPath])
	.then(function(res) {

		// Ensure that the Python output is converted to JSON
		return JSON.parse(res).data
	})
};

module.exports = {
  speechEmotionRecognition: speechEmotionRecognition
}