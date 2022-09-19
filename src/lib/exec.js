const { exec } = require('child_process');
const path = require('path');
const EC = require('elliptic').ec;
const { prepareFile, getFlowJson, saveFlowJson, cleanUp } = require('./file');

const execRead = function (contract, property, type, options) {
    const tempFile = prepareFile(options.network, path.join(__dirname, 'Read.cdc'), [contract, property, type]);
    const command = `flow scripts execute ${tempFile}`;

    execCommand(command, options, (stdout) => {
        console.log(stdout);

        if (!options.debug) {
            cleanUp(tempFile);
        }
    });
};

const execScript = function (path, args, options) {
    const tempFile = prepareFile(options.network, path);
    const command = `flow scripts execute ${tempFile} ${args.reduce((c, a) => `${c} "${a}"`, '')}`;

    execCommand(command, options, (stdout) => {
        console.log(stdout);

        if (!options.debug) {
            cleanUp(tempFile);
        }
    });
};

const execTransaction = function (path, args, options) {
    const tempFile = prepareFile(options.network, path);
    let command = `flow transactions send ${tempFile}${args.reduce((c, a) => `${c} "${a}"`, '')}`;

    if (options.signer) {
        command += ` --signer ${options.signer}`;
    }

    execCommand(command, options, (stdout) => {
        console.log(stdout);

        if (!options.debug) {
            cleanUp(tempFile);
        }
    });
};

const execAccountsCreate = function (options) {
    let privateKey = options.privateKey;
    let publicKey = options.publicKey;

    if (!privateKey || !publicKey) {
        const ec = new EC('p256');
        const keyPair = ec.genKeyPair();
        privateKey = keyPair.getPrivate('hex');
        publicKey = keyPair.getPublic('hex').substring(2);
    }

    let command = `flow accounts create --key ${publicKey}`;

    if (options.signer) {
        command += ` --signer ${options.signer}`;
    }

    execCommand(command, options, (stdout) => {
        const matches = /^Address.*/gm.exec(stdout);

        if (matches[0]) {
            const address = matches[0].replace('Address', '').trim();

            const flowJson = getFlowJson();

            flowJson.accounts[options.name] = {
                address: address,
                key: privateKey,
            };

            saveFlowJson(flowJson);
            console.log(address);
        } else {
            console.log(stdout);
        }
    });
};

const execCommand = function (cmd, options, callback) {
    cmd += ` --network ${options.network} -l error`;

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
        }

        if (callback) {
            callback(stdout);
        }
    });
};

module.exports = {
    execRead,
    execScript,
    execTransaction,
    execAccountsCreate,
};
