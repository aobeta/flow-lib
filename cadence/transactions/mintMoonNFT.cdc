import TheMoonNFTContract from 0xf8d6e0586b0a20c7

transaction (
    mediaUrl: String,
    creator: String,
    creatorProfile: String,
    metadata: {String : String},
    groupId: String,
    count: Int
){
    let mintCollection: &TheMoonNFTContract.AdminMintedCollection
    let minterRef: &TheMoonNFTContract.NFTMinter

    prepare(principalMoonAccount: AuthAccount) {
        self.mintCollection = principalMoonAccount.borrow<&TheMoonNFTContract.AdminMintedCollection>(from: TheMoonNFTContract.ADMIN_MINT_COLLECTION_PATH) ??
            panic("Could not borrow platform seller")

        self.minterRef = principalMoonAccount.borrow<&TheMoonNFTContract.NFTMinter>(from: TheMoonNFTContract.MINTER_STORAGE_PATH) ??
            panic("Could not borrow nft minter")
    }

    execute {
        let groupOfNFts : [TheMoonNFTContract.MoonNFTMetadata] = []
        var i = count
        while i > 0 {
            let newMetadata = metadata
            newMetadata["totalEditions"] = count.toString()
            newMetadata["edition"] = i.toString()

            let nftData = TheMoonNFTContract.MoonNFTMetadata(
                nil,
                mediaUrl,
                creator: creator,
                profile: creatorProfile,
                metadata: newMetadata
            )
            i = i - 1
        }

        let groupMetadata =  TheMoonNFTContract.MoonNFTMetadata(
                nil,
                mediaUrl,
                creator: creator,
                profile: creatorProfile,
                metadata: metadata
        )

        let nfts <- self.minterRef.bulkMintNft(groupOfNFts)
        log("All Nft's Minted")

        self.mintCollection.depositGroup(groupId, groupMetadata, <- nfts)
        log("Minted MoonNFT deposited in Platform Seller")
    }
}
