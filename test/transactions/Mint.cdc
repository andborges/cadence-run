import FungibleToken from 0xee82856bf20e2aa6
import DemoToken from 0xf8d6e0586b0a20c7

transaction(recipient: Address, amount: UFix64) {
    let tokenAdmin: &DemoToken.Administrator

    let tokenReceiver: &{FungibleToken.Receiver}

    let supplyBefore: UFix64

    prepare(signer: AuthAccount) {
        self.supplyBefore = DemoToken.totalSupply

        self.tokenAdmin = signer.borrow<&DemoToken.Administrator>(from: DemoToken.AdminStoragePath)
            ?? panic("Signer is not the token admin")

        self.tokenReceiver = getAccount(recipient)
            .getCapability(DemoToken.ReceiverPublicPath)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Unable to borrow receiver reference")
    }

    execute {
        let minter <- self.tokenAdmin.createNewMinter(allowedAmount: amount)
        let mintedVault <- minter.mintTokens(amount: amount)

        self.tokenReceiver.deposit(from: <- mintedVault)

        destroy minter
    }

    post {
        DemoToken.totalSupply == self.supplyBefore + amount: "The total supply must be increased by the amount"
    }
}
