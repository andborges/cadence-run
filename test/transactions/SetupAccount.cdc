import FungibleToken from 0xee82856bf20e2aa6
import DemoToken from 0xf8d6e0586b0a20c7

transaction {
    prepare(signer: AuthAccount) {
        if signer.borrow<&DemoToken.Vault>(from: DemoToken.VaultStoragePath) != nil {
            return
        }

        signer.save(
            <- DemoToken.createEmptyVault(),
            to: DemoToken.VaultStoragePath
        )

        signer.link<&DemoToken.Vault{FungibleToken.Receiver}>(
            DemoToken.ReceiverPublicPath,
            target: DemoToken.VaultStoragePath
        )
 
        signer.link<&DemoToken.Vault{FungibleToken.Balance}>(
            DemoToken.BalancePublicPath,
            target: DemoToken.VaultStoragePath
        )
    }
}
