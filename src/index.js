#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const commander = require('commander');

const program = new commander.Command();

const execRead = function(options) {
    const tempFile = prepareFile(options.network, path.join(__dirname, 'templates', 'Read.cdc'), [options.contract, options.property, options.return]);
    const command = `flow scripts execute ${tempFile} -l error`

    execCommand(command, () => {
        fs.unlinkSync(tempFile);
    });
}

const execScript = function(options) {
    const tempFile = prepareFile(options.network, options.file);
    const command = `flow scripts execute ${tempFile} ${options.args} -l error`

    execCommand(command, () => {
        fs.unlinkSync(tempFile);
    });
}

const execTransaction = function(options) {
    const tempFile = prepareFile(options.network, options.file);
    let command = `flow transactions send ${tempFile} ${options.args} -l error`

    if (options.signer) {
        command += ` --signer ${options.signer}`;
    }

    execCommand(command, () => {
        fs.unlinkSync(tempFile);
    });
}

const execCommand = function(cmd, callback) {
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
}

const prepareFile = function(network, file, params) {
    const flow = JSON.parse(fs.readFileSync('./flow.json'));

    let data = fs.readFileSync(file).toString();

    if (params) {
        for (let i = 0; i < params.length; i++) {
            data = data.replace(new RegExp('#' + (i + 1), 'g'), params[i]);
        }
    }

    // Removing imports
    data = data.replace(/^import.*$/gm, '');

    // Adding imports from flow.json by network
    const contracts = Object.keys(flow.contracts);

    for (let i = 0; i < contracts.length; i++) {
        if (flow.contracts[contracts[i]].aliases[network]) {
            data = `import ${contracts[i]} from ${flow.contracts[contracts[i]].aliases[network]}\n${data}`;
        }
    }

    const filename = path.basename(file);
    const tempFile = `./${uuidv4()}_${filename}`;

    fs.writeFileSync(tempFile, data);

    return tempFile;
}

program
    .version('1.0.0', '-v, --version')
    .usage('[command] [options]')

program
    .option('-n, --network <value>', 'Network to execute', 'emulator');

program
    .command('read')
    .option('-c, --contract <value>', 'Contract name')
    .option('-p, --property <value>', 'Property to read')
    .option('-r, --return <value>', 'Return type')
    .action((options, cmd) => {
        execRead(cmd.optsWithGlobals());
    });

program
    .command('script')
    .requiredOption('-f, --file <path>', 'Path of the script.')
    .option('-a, --args <values>', 'Script arguments', '')
    .action((options, cmd) => {
        execScript(cmd.optsWithGlobals());
    });

program
    .command('transaction')
    .requiredOption('-f, --file <path>', 'Path of the transaction.')
    .option('-a, --args <values>', 'Transaction arguments', '')
    .option('-s, --signer <value>', 'Transaction signer account name', '')
    .action((options, cmd) => {
        execTransaction(cmd.optsWithGlobals());
    });

program.parse(process.argv);
