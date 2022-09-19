# flow-run

A tool to simplify and extend flow-cli usage.

## Initial motivation

When dealing with Flow Blockchain transactions and scripts, we use the flow-cli to make the execution on the environments.  
For example:

```
flow transactions send ./cadence/transactions/SomeTransaction.cdc "arg1" "arg2" --signer emulator-account
```

```
flow scripts execute ./cadence/scripts/SomeScript.cdc "arg1" "arg2"
```

The problem starts because usually the transactions and scripts files have some _imports_:

```
import FungibleToken from 0xee82856bf20e2aa6
import DemoToken from 0xf8d6e0586b0a20c7

pub fun main(account: Address): UFix64 {
    let acct = getAccount(account)

    let vaultRef = acct.getCapability(DemoToken.BalancePublicPath)
        .borrow<&DemoToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
```

But the addres for these _imports_ changes from one environment to other.

**So, to execute the scripts sometimes on the application, sometimes using flow-cli, and also, using the flow-cli doing the execution in different environments (emulator, testnet, mainnet), we have to change the _import_ addresses all the time.**

This is so time consuming and frustating! So the initial motivation is to handle the _import_ addresses gracefully when executing the scripts and transactions on the command line.

## Usage

The most common way is to install the tool globally using _npm_:

```
npm install flow-run -g
```

The tool basically keep the same structure of the flow-cli commands! (There's one exception, for the _"flow accounts create"_ command. [See below](#flow-accounts-create-command)).

So if you want to execute this transaction:

```
flow transactions send ./cadence/transactions/SomeTransaction.cdc "arg1" "arg2" --signer emulator-account
```

You just need to change "flow" by "flow-run":

```
flow-run transactions send ./cadence/transactions/SomeTransaction.cdc "arg1" "arg2" --signer emulator-account
```

The same for scripts. This:

```
flow scripts execute ./cadence/scripts/SomeScript.cdc "arg1" "arg2"
```

Would become:

```
flow-run scripts execute ./cadence/scripts/SomeScript.cdc "arg1" "arg2"
```

### flow accounts create command

Due to issues with the flow-cli "flow accounts create" command, we changed a little bit the behavior, for convenience.  
We added the argument "--name" to the command, so you will be able to inform on the command line the name of the account you're creating.

On the flow-cli command, you only have the chance to inform the account's name on the interative version of the command:

```
flow accounts create
v Enter an account name: Alice█
```

But using _flow-run_ command, you will be able to send the name:

```
flow-run accounts create --name Alice
```

This command will generate a public and private keys, create the account on the blockchain and update the _flow.json_ "accounts" section with the "Alice" account.

> Important: If there's already an account named "Alice" in your _flow.json_, it will be updated to the new account created.

## How it works

The tools respects the _flow.json_ configuration file of your project, replacing the _imports_ you have in your files by some generated _imports_ built dinamically accordingly to the specified network, looking to the "contracts/aliases" configuration of the _flow.json_ file.

For example, given this _flow.json_ "contracts" section:

```
"contracts": {
    "DemoToken": {
      "source": "./cadence/contracts/DemoToken.cdc",
      "aliases": {
        "emulator": "0xf8d6e0586b0a20c7",
        "testnet": "0x03c4ce9102e879bb"
      }
    },

    "FungibleToken": {
      "source": "./cadence/contracts/FungibleToken.cdc",
      "aliases": {
        "emulator": "0xee82856bf20e2aa6",
        "testnet": "0x9a0766d93b6608b7"
      }
    }
}
```

And given the following script file named "SomeScript.cdc":

```
import FungibleToken from "./FungibleToken.cdc"
import DemoToken from "./DemoToken.cdc"

pub fun main(account: Address): UFix64 {
    let acct = getAccount(account)

    let vaultRef = acct.getCapability(DemoToken.BalancePublicPath)
        .borrow<&DemoToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
```

Running this command:

```
flow-run scripts execute ./cadence/scripts/SomeScript.cdc --network emulator
```

Will dinamically generate (and execute) a script like this:

```
import FungibleToken from 0xee82856bf20e2aa6
import DemoToken from 0xf8d6e0586b0a20c7

pub fun main(account: Address): UFix64 {
    let acct = getAccount(account)

    let vaultRef = acct.getCapability(DemoToken.BalancePublicPath)
        .borrow<&DemoToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
```

Otherwise, running this command:

```
flow-run scripts execute ./cadence/scripts/SomeScript.cdc --network testnet
```

Will dinamically generate (and execute) a script like this:

```
import FungibleToken from 0x9a0766d93b6608b7
import DemoToken from 0x03c4ce9102e879bb

pub fun main(account: Address): UFix64 {
    let acct = getAccount(account)

    let vaultRef = acct.getCapability(DemoToken.BalancePublicPath)
        .borrow<&DemoToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
```

> Important! The tool makes a local temporary copy of your transactions and scripts files, never changing the original files.

## Extra stuff

Additionally, the tools have other convenience commands, other than the flow-cli "replacements":

### Read smart contract public variable

The command "read" allows access to the value of any public variable. For example, this command:

```
flow-run read FlowToken totalSupply UFix64 --network testnet
```

Will display the value of the variable "totalSupply" of the smart contract "FlowToken" deployed on the testnet, without the need of a script to be created.

## Commands reference

### Global arguments (Can be passed to any command)

**--network <network> or -n <network>**: The network to execute the command. Must exists on _flow.json_ configuration file. Default: "emulator"  
**--debug or -d**: Execute the command in Debug mode. Basically do not delete the temporary script/transaction generated by the tool. Default: false

### "transactions send" command

```
flow-run transactions send ./cadence/transactions/SomeTransaction.cdc "arg1" "arg2" --signer emulator-account
```

### "scripts execute" command

```
flow-run scripts execute ./cadence/scripts/SomeScript.cdc "arg1" "arg2"
```

### "accounts create" command

```
flow-run accounts create --name Alice
```

### "read" command

```
flow-run read FlowToken totalSupply UFix64
```
