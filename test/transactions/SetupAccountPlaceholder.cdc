import FungibleToken from 0xee82856bf20e2aa6
import Placeholder1 from 0xf8d6e0586b0a20c7

transaction {
    prepare(signer: AuthAccount) {
        if signer.borrow<&Placeholder1.Vault>(from: Placeholder1.VaultStoragePath) != nil {
            return
        }

        signer.save(
            <- Placeholder1.createEmptyVault(),
            to: Placeholder1.VaultStoragePath
        )

        signer.link<&Placeholder1.Vault{FungibleToken.Receiver}>(
            Placeholder1.ReceiverPublicPath,
            target: Placeholder1.VaultStoragePath
        )
 
        signer.link<&Placeholder1.Vault{FungibleToken.Balance}>(
            Placeholder1.BalancePublicPath,
            target: Placeholder1.VaultStoragePath
        )
    }
}
 