const { spawn } = require('child_process');

/**
 * Runs the given Python script with the given arguments.
 * Returns the output as a Promise.
 */
function pythonRunner(scriptPath, args=[]) {
    return new Promise((resolve, reject) => {
        const program = spawn('python',  [scriptPath].concat(args));

        program.stdout.on('data', data => {
            resolve(data.toString());
        });

        program.stderr.on('data', data => {
            reject(data.toString());
        })
    });
}

module.exports = {
    run: pythonRunner
}