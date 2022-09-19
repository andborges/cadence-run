#!/usr/bin/env node

const commander = require('commander');
const { execRead, execScript, execTransaction, execAccountsCreate } = require('./lib/exec');

const program = new commander.Command();

program.version('1.0.0', '-v, --version').usage('[command] [options]');

program.option('-n, --network <value>', 'Network from configuration file (default "emulator")', 'emulator');
program.option('-d, --debug', 'Execute the command in Debug mode');

program.command('read <contract> <property> <type>').action((contract, property, type, options, cmd) => {
    execRead(contract, property, type, cmd.optsWithGlobals());
});

const scriptsCmd = new commander.Command('scripts');
scriptsCmd.command('execute <path> [args...]').action((path, args, options, cmd) => {
    execScript(path, args, cmd.optsWithGlobals());
});

const transactionsCmd = new commander.Command('transactions');
transactionsCmd
    .command('send <path> [args...]')
    .option(
        '-s, --signer <value>',
        'Account name from configuration used to sign the transaction (default "emulator-account")',
        'emulator-account'
    )
    .action((path, args, options, cmd) => {
        execTransaction(path, args, cmd.optsWithGlobals());
    });

const accountsCmd = new commander.Command('accounts');
accountsCmd
    .command('create')
    .requiredOption('-n, --name <value>', 'Account name')
    .option('-pr, --privateKey <value>', 'Private key to attach to account (Required if public key is sent)')
    .option('-pu, --publicKey <value>', 'Public key to attach to account (Required if private key is sent)')
    .option(
        '-s, --signer <value>',
        'Account name from configuration used to sign the transaction (default "emulator-account")',
        'emulator-account'
    )
    .action((options, cmd) => {
        execAccountsCreate(cmd.optsWithGlobals());
    });

program.addCommand(scriptsCmd);
program.addCommand(transactionsCmd);
program.addCommand(accountsCmd);

program.parse(process.argv);
