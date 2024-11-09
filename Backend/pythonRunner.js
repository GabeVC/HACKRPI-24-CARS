const { PythonShell } = require('python-shell');

function runPythonScript(data) {
  return new Promise((resolve, reject) => {
    let options = {
      mode: 'json',
      pythonOptions: ['-u'], 
      scriptPath: './scripts', 
      args: [JSON.stringify(data)]
    };

    PythonShell.run('process_data.py', options, (err, results) => {
      if (err) reject(err);
      else resolve(results && results[0]); 
    });
  });
}

module.exports = { runPythonScript };
