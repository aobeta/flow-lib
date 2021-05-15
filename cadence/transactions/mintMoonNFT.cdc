import TheMoonNFTContract from 0xf8d6e0586b0a20c7

transaction (mediaUrl: String, creator: String, creatorProfile: String, metadata: {String : String}){
    let platformSeller: &TheMoonNFTContract.SinglePlatformSeller
    let minterRef: &TheMoonNFTContract.NFTMinter

    prepare(principalMoonAccount: AuthAccount) {
        self.platformSeller = principalMoonAccount.borrow<&TheMoonNFTContract.SinglePlatformSeller>(from: TheMoonNFTContract.SINGLE_PLATFORM_SELLER_PATH) ??
            panic("Could not borrow platform seller")

        self.minterRef = principalMoonAccount.borrow<&TheMoonNFTContract.NFTMinter>(from: TheMoonNFTContract.MINTER_STORAGE_PATH) ??
            panic("Could not borrow nft minter")
    }

    execute {
        let nftData = TheMoonNFTContract.MoonNFTMetadata(
            nil,
            mediaUrl,
            creator: creator,
            profile: creatorProfile,
            metadata: metadata
        )

        let newNFT <- self.minterRef.mintNFT(nftData)
        log("New MoonNFT minted : ".concat(newNFT.id.toString()))

        self.platformSeller.depositNft(<- newNFT)
        log("Minted MoonNFT deposited in Platform Seller")
    }
}
