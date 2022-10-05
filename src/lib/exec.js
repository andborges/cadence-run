const { execSync } = require('child_process');
const path = require('path');
const EC = require('elliptic').ec;
const { prepareFile, getFlowJson, saveFlowJson, cleanUp } = require('./file');

const execRead = function (contract, property, type, options) {
    const placeholders = `{
        Placeholder1: "${contract}",
        Placeholder2: "${property}",
        Placeholder3: "${type}"
    }`;

    const tempFile = prepareFile(options.network, path.join(__dirname, 'Read.cdc'), placeholders);
    const command = `flow scripts execute ${tempFile}`;

    execCommand(command, options, (stdout) => {
        console.log(stdout);

        if (!options.debug) {
            cleanUp(tempFile);
        }
    });
};

const execScript = function (path, args, options) {
    const tempFile = prepareFile(options.network, path, options.placeholders);
    const command = `flow scripts execute ${tempFile} ${args.reduce((c, a) => `${c} "${a}"`, '')}`;

    execCommand(command, options, (stdout) => {
        console.log(stdout);

        if (!options.debug) {
            cleanUp(tempFile);
        }
    });
};

const execTransaction = function (path, args, options) {
    const tempFile = prepareFile(options.network, path, options.placeholders);
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
    const ec = new EC('p256');
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate('hex');
    const publicKey = keyPair.getPublic('hex').substring(2);

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
                key: {
                    type: 'hex',
                    index: 0,
                    signatureAlgorithm: 'ECDSA_P256',
                    hashAlgorithm: 'SHA3_256',
                    privateKey: privateKey,
                },
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

    try {
        const stdout = execSync(cmd).toString();

        if (callback) {
            callback(stdout);
        }
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};

module.exports = {
    execRead,
    execScript,
    execTransaction,
    execAccountsCreate,
};
