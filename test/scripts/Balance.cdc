import FungibleToken from 0xee82856bf20e2aa6
import DemoToken from 0xf8d6e0586b0a20c7

pub fun main(account: Address): UFix64 {
    let acct = getAccount(account)

    let vaultRef = acct.getCapability(DemoToken.BalancePublicPath)
        .borrow<&DemoToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
 