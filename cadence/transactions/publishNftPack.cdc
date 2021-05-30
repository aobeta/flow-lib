import TheMoonNFTContract from 0xf8d6e0586b0a20c7

transaction (
    _ groupIds: [String],
    previewMediaUrl: String,
    description: String,
    creator: String?,
    creatorProfile: String?
) {
    let mintCollection: &TheMoonNFTContract.AdminMintedCollection
    let minterRef: &TheMoonNFTContract.NFTMinter
    let platformSeller: &TheMoonNFTContract.SinglePlatformSeller

    prepare(principalMoonAccount: AuthAccount) {
        self.mintCollection = principalMoonAccount.borrow<&TheMoonNFTContract.AdminMintedCollection>(from: TheMoonNFTContract.ADMIN_MINT_COLLECTION_PATH) ??
                panic("Could not borrow minted collection")

        self.minterRef = principalMoonAccount.borrow<&TheMoonNFTContract.NFTMinter>(from: TheMoonNFTContract.MINTER_STORAGE_PATH) ??
            panic("Could not borrow nft minter")

        self.platformSeller = principalMoonAccount.borrow<&TheMoonNFTContract.SinglePlatformSeller>(from: TheMoonNFTContract.SINGLE_PLATFORM_SELLER_PATH) ??
            panic("Could not borrow the Single Platform Seller")
    }

    pre {
       groupIds.length > 0 : "No GroupIds supplied"
    }

    execute {
        let packData  = TheMoonNFTContract.MoonNftPackData(
            0 as UInt64, // not used to create pack.
            [], // not used to create pack
            previewMediaUrl,
            description: description,
            creator: creator,
            profile: creatorProfile
        )

        let nfts <- self.mintCollection.pickNfts(groupIds)

        let nftPack <- self.minterRef.createNFTPack(<- nfts, packData)

        self.platformSeller.depositPack(<- nftPack)
    }
}
