#!/usr/bin/env node

const commander = require('commander');
const { execRead, execScript, execTransaction } = require('./lib/exec');

const program = new commander.Command();

program.version('1.0.0', '-v, --version').usage('[command] [options]');

program.option('-n, --network <value>', 'Network to execute', 'emulator');

program.command('read <contract> <property> <type>').action((contract, property, type, options, cmd) => {
    execRead(contract, property, type, cmd.optsWithGlobals());
});

const scriptsCmd = program.command('scripts');
scriptsCmd.command('execute <path> [args...]').action((path, args, options, cmd) => {
    execScript(path, args, cmd.optsWithGlobals());
});

const transactionsCmd = program.command('transactions');
transactionsCmd
    .command('send <path> [args...]')
    .option('-s, --signer <value>', 'Transaction signer account name', '')
    .action((path, args, options, cmd) => {
        execTransaction(path, args, cmd.optsWithGlobals());
    });

program.addCommand(scriptsCmd);
program.addCommand(transactionsCmd);

program.parse(process.argv);
