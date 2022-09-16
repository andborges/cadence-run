const { exec } = require('child_process');
const path = require('path');
const { prepareFile, cleanUp } = require('./file');

const execRead = function (contract, property, type, options) {
    const tempFile = prepareFile(options.network, path.join(__dirname, 'Read.cdc'), [contract, property, type]);
    const command = `flow scripts execute ${tempFile} -l error`;

    execCommand(command, () => {
        cleanUp(tempFile);
    });
};

const execScript = function (path, args, options) {
    const tempFile = prepareFile(options.network, path);
    const command = `flow scripts execute ${tempFile} ${args.reduce((c, a) => `${c} "${a}"`, '')} -l error`;

    execCommand(command, () => {
        cleanUp(tempFile);
    });
};

const execTransaction = function (path, args, options) {
    const tempFile = prepareFile(options.network, path);
    let command = `flow transactions send ${tempFile}${args.reduce((c, a) => `${c} "${a}"`, '')}`;

    if (options.signer) {
        command += ` --signer ${options.signer}`;
    }

    command += ' -l error';

    execCommand(command, () => {
        cleanUp(tempFile);
    });
};

const execCommand = function (cmd, callback) {
    exec(cmd, (err, stdout, stderr) => {
        let error;

        if (err) {
            error = err.message;
        }

        if (stderr) {
            error = stderr;
        }

        if (error) {
            console.error(error);
        } else {
            console.log(stdout);
        }

        if (callback) {
            callback();
        }
    });
};

module.exports = { execRead, execScript, execTransaction };
