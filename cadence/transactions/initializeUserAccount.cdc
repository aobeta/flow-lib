import TheMoonNFTContract from 0xf8d6e0586b0a20c7

transaction {
    let userAccount: AuthAccount

    prepare(userAccount: AuthAccount) {
        self.userAccount = userAccount
    }

    execute {
        self.userAccount.save(<- TheMoonNFTContract.createEmptyCollection(), to: TheMoonNFTContract.COLLECTION_STORAGE_PATH)
        self.userAccount.link<&{TheMoonNFTContract.NFTReceiver}>(TheMoonNFTContract.NFT_RECEIVER_PUBLIC_PATH, target: TheMoonNFTContract.COLLECTION_STORAGE_PATH)
    }

    post {
        self.userAccount.getCapability<&{TheMoonNFTContract.NFTReceiver}>(TheMoonNFTContract.NFT_RECEIVER_PUBLIC_PATH) != nil :
            "Account was unsuccessfully linked"
    }
}
