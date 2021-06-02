pub contract TheMoonNFTContract {

    // Path for the receiver capability
    pub let NFT_RECEIVER_PUBLIC_PATH: PublicPath
    // Path for the QueryMintedCollection
    pub let QUERY_MINTED_COLLECTION_PATH: PublicPath
    // Path for seller catalog capability
    pub let SELLER_CATALOG_PATH: PublicPath

    // Path for the nft collection resource
    pub let COLLECTION_STORAGE_PATH: StoragePath
    // Path for minter resource
    pub let MINTER_STORAGE_PATH: StoragePath
    // Path for platform seller resource
    pub let SINGLE_PLATFORM_SELLER_PATH: StoragePath
    // Path for AdminMintCollection resource
    pub let ADMIN_MINT_COLLECTION_PATH: StoragePath



    pub struct MoonNftData {
        pub let id: UInt64?
        pub let originalContentCreator: String
        pub let creatorProfile: String
        pub let mediaUrl : String
        pub let metadata: { String : String }

        init (
            _ id: UInt64?,
            _ mediaUrl: String,
            creator originalContentCreator: String,
            profile creatorProfile: String,
            metadata: { String : String }
        ){
            self.id = id
            self.originalContentCreator = originalContentCreator
            self.mediaUrl = mediaUrl
            self.metadata = metadata
            self.creatorProfile = creatorProfile
        }
    }

    pub struct MoonNftPackData {
        pub let id: UInt64
        pub let previewMediaUrl: String
        pub let collectionNftIds : [UInt64]
        pub let description: String
        pub let creator: String?
        pub let creatorProfile: String?

        init(
            _ id: UInt64,
            _ nftIds: [UInt64],
            _ previewMediaUrl: String,
            description: String,
            creator: String?,
            profile: String?,
        ) {
            self.id = id
            self.creator = creator
            self.collectionNftIds = nftIds
            self.creatorProfile = profile
            self.previewMediaUrl = previewMediaUrl
            self.description = description
        }
    }

    pub resource MoonNFT {
        pub let id: UInt64
        pub let originalContentCreator: String
        pub let creatorProfile: String
        pub let mediaUrl : String
        pub let metadata: { String : String }

        init(
            _ initID: UInt64,
            _ mediaUrl: String ,
            creator originalContentCreator: String ,
            profile creatorProfile: String,
            metadata: { String : String }
        ) {
            self.id = initID
            self.mediaUrl = mediaUrl
            self.originalContentCreator = originalContentCreator
            self.metadata = metadata
            self.creatorProfile = creatorProfile
        }

        pub fun getMetaData () : MoonNftData {
            return MoonNftData(
                self.id,
                self.mediaUrl,
                creator: self.originalContentCreator,
                profile: self.creatorProfile,
                metadata: self.metadata
            )
        }
    }

    pub resource MoonNFTPack {
        pub let id: UInt64
        pub let previewMediaUrl: String
        pub let pack : @[MoonNFT]
        pub let description: String
        // made this optional in case we decide to mix nfts from different creators
        // into one pack
        pub let originalContentCreator: String?
        pub let creatorProfile: String?


        init (
            _ packId: UInt64,
            _ initialPack : @[MoonNFT],
            _ previewMediaUrl: String,
            description: String,
            creator originalContentCreator : String?,
            creatorProfile: String?
        ) {
            self.pack <- initialPack
            self.originalContentCreator = originalContentCreator
            self.creatorProfile = creatorProfile
            self.id = packId
            self.previewMediaUrl = previewMediaUrl
            self.description = description
        }

        // TODO improve by generating the metadata in init, then storing as variable,
        // then simply return reference to metadata
        pub fun getMetaData(): MoonNftPackData {
            let nftIds : [UInt64] = []

            var i = 0
            while i < self.pack.length {
                let nft <- self.pack.remove(at: i)
                nftIds.append(nft.id)
                self.pack.append(<- nft)

                i = i + 1
            }

            return MoonNftPackData(
                self.id,
                nftIds,
                self.previewMediaUrl,
                description: self.description,
                creator: self.originalContentCreator,
                profile: self.creatorProfile)
        }

        destroy () {
            destroy self.pack
        }
    }

    pub resource interface NFTReceiver {
        pub fun deposit(token: @MoonNFT)
        pub fun getIDs(): [UInt64]
        pub fun idExists(id: UInt64): Bool
        pub fun getMetadata(id: UInt64) : {String : String}
    }

    pub resource Collection: NFTReceiver {
        pub var ownedNFTs: @{UInt64: MoonNFT}
        pub var metadataObjs: {UInt64: { String : String }}

        init () {
            self.ownedNFTs <- {}
            self.metadataObjs = {}
        }

        pub fun withdraw(withdrawID: UInt64): @MoonNFT {
            let token <- self.ownedNFTs.remove(key: withdrawID)!

            return <-token
        }

        pub fun deposit(token: @MoonNFT) {
            self.metadataObjs[token.id] = token.metadata
            self.ownedNFTs[token.id] <-! token
        }

        pub fun idExists(id: UInt64): Bool {
            return self.ownedNFTs[id] != nil
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun getMetadata(id: UInt64): {String : String} {
            pre {
                self.idExists(id: id) : "Token Does not exist"
            }

            return self.metadataObjs[id]!
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub resource interface SellerCatalog {
        pub let nftsByCreatorProfile: {String: [MoonNftData]}
        pub let packsByCreatorProfile: {String: [MoonNftPackData]}

        pub let nftsByCreator: {String: [MoonNftData]}
        pub let packsByCreator: {String: [MoonNftPackData]}

        pub fun getAllPacks(): [MoonNftPackData]
        pub fun getTotalPackCount(): Int
        pub fun packExists(id: UInt64): Bool

        pub fun getAllNFTs(): [MoonNftData]
        pub fun getTotalNFTCount(): Int
        pub fun nftExists(id: UInt64): Bool
    }

    pub resource SinglePlatformSeller: SellerCatalog {
        pub let nftPacksForSale: @{UInt64 : MoonNFTPack}
        pub let nftsForSale: @{UInt64 : MoonNFT}

        pub let nftsByCreatorProfile: {String: [MoonNftData]}
        pub let packsByCreatorProfile: {String: [MoonNftPackData]}

        pub let nftsByCreator: {String: [MoonNftData]}
        pub let packsByCreator: {String: [MoonNftPackData]}

        init() {
            self.nftPacksForSale <- {}
            self.nftsForSale <- {}

            self.nftsByCreatorProfile = {}
            self.packsByCreatorProfile = {}

            self.nftsByCreator = {}
            self.packsByCreator = {}
        }

        // TODO paginate
        pub fun getAllPacks(): [MoonNftPackData] {
            let packs: [MoonNftPackData] = []

            for packId in self.nftPacksForSale.keys {
                let oldPack <- self.nftPacksForSale.remove(key: packId)
                let packMetadata = oldPack?.getMetaData()
                packs.append(packMetadata!)

                let nullPack <- self.nftPacksForSale.insert(key: packId, <- oldPack!)
                destroy nullPack
            }

            return packs
        }
        pub fun getTotalPackCount(): Int {
            return self.nftPacksForSale.keys.length
        }
        pub fun packExists(id: UInt64 ): Bool {
            return self.nftPacksForSale.containsKey(id)
        }

        pub fun getAllNFTs(): [MoonNftData] {
            let nfts: [MoonNftData] = []

            for nftId in self.nftPacksForSale.keys {
                let nft <- self.nftsForSale.remove(key: nftId)
                let nftMetadata = nft?.getMetaData()
                nfts.append(nftMetadata!)

                let nullNft <- self.nftsForSale.insert(key: nftId, <- nft!)
                destroy nullNft
            }

            return nfts
        }
        pub fun getTotalNFTCount(): Int {
            return self.nftsForSale.keys.length
        }

        pub fun nftExists(id: UInt64 ): Bool {
            return self.nftsForSale.containsKey(id)
        }

        pub fun withdrawPack(id packId: UInt64): @MoonNFTPack {
            pre {
                self.packExists(id: packId) : "Pack does not exist"
            }

            let pack <- self.nftPacksForSale.remove(key: packId)!

            return <- pack
        }

        pub fun depositNft(_ nft: @MoonNFT) {
            pre {
                false : "Not Implemented"
            }
            // TODO
            destroy nft
        }

        pub fun depositPack(_ pack: @MoonNFTPack) {
            if (pack.originalContentCreator != nil) {
                if (!self.packsByCreator.containsKey(pack.originalContentCreator!)) {
                    self.packsByCreator.insert(key: pack.originalContentCreator!, [])
                }

                let creatorCollection = &self.packsByCreator[pack.originalContentCreator!] as &[MoonNftPackData]
                creatorCollection.append(pack.getMetaData())
            }

            if (pack.creatorProfile != nil) {
                if (!self.packsByCreatorProfile.containsKey(pack.creatorProfile!)) {
                    self.packsByCreatorProfile.insert(key: pack.creatorProfile!, [])
                }

                let creatorProfileCollection = &self.packsByCreatorProfile[pack.creatorProfile!] as &[MoonNftPackData]
                creatorProfileCollection.append(pack.getMetaData())
            }

            let old <- self.nftPacksForSale.insert(key: pack.id, <- pack)

            // pack Ids are unique so we are guaranteed
            // not to be destroying an actual pack here
            destroy old
        }

        pub fun bulkDepositPack(_ packs: @[MoonNFTPack]) {
            var i = 0
            while packs.length > 0  {
                let pack <- packs.removeFirst()
                self.depositPack(<- pack)

                i = i + 1
            }

            destroy packs
        }

        pub fun bulkDepositNft(_ nfts: @[MoonNFT]) {
            pre {
                false : "Not Implemented"
            }
            // TODO
            destroy nfts
        }

        destroy() {
            destroy self.nftPacksForSale
            destroy self.nftsForSale
        }
    }

    pub resource NFTMinter {
        access(self) var nftIdCount: UInt64
        access(self) var packIdCount: UInt64

        init() {
            self.nftIdCount = 0
            self.packIdCount = 0
        }

        access(self) fun incrementNftIdCount() {
            self.nftIdCount = self.nftIdCount + 1 as UInt64
        }

        access(self) fun incrementPackIdCount() {
            self.packIdCount = self.packIdCount + 1 as UInt64
        }

        pub fun mintNFT (_ nftData: MoonNftData ): @MoonNFT {
            self.incrementNftIdCount()
            var newNFT <- create MoonNFT(
                self.nftIdCount,
                nftData.mediaUrl,
                creator: nftData.originalContentCreator,
                profile: nftData.creatorProfile,
                metadata: nftData.metadata
            )

            return <-newNFT
        }

        pub fun bulkMintNft (_ nftsToMint: [MoonNftData]): @[MoonNFT] {
            pre {
                nftsToMint.length > 0 : "[NFTMinter] No NFT's that we can mint"
            }

            let mintedNfts : @[MoonNFT] <- []

            for nftData in nftsToMint {
                let newNFT <- self.mintNFT(nftData)

                mintedNfts.append(<- newNFT)

            }

            return <- mintedNfts
        }

        pub fun createNFTPack (_ packOfNfts: @[MoonNFT], _ data: MoonNftPackData) : @MoonNFTPack {
            self.incrementPackIdCount()
            return <- create MoonNFTPack(
                self.packIdCount,
                <- packOfNfts,
                data.previewMediaUrl,
                description: data.description,
                creator: data.creator,
                creatorProfile: data.creatorProfile
            )
        }
    }

    pub resource interface QueryMintedCollection {
        pub fun getAllGroups() : [NftGroupData]
        pub fun getGroupInfo(_ groupId: String) : NftGroupData
        pub fun getAllIds() : [UInt64]
    }

    pub resource AdminMintedCollection : QueryMintedCollection {
        pub let groupMetadata : {String : MoonNftData}
        pub let groupNftIds : { String : {UInt64 : UInt64} }
        pub let nfts : @{ UInt64 : MoonNFT }

        pub let creatorToGroupMap : { String : String}
        pub let creatorProfileToGroupMap : { String : String }

        init () {
            self.groupMetadata = {}
            self.groupNftIds = {}
            self.nfts <- {}

            self.creatorToGroupMap = {}
            self.creatorProfileToGroupMap = {}
        }

        pub fun depositGroup(_ groupId: String, _ groupMetadata: MoonNftData, _ nfts: @[MoonNFT]){
            pre {
                nfts.length > 0 : "No NFT's to deposit"
            }

            self.groupMetadata[groupId] = groupMetadata
            var nftIds : {UInt64 : UInt64} = {}

            while nfts.length > 0 {
                let nft <- nfts.removeLast()
                nftIds.insert(key: nft.id, nft.id);

                let nullNft <- self.nfts.insert(key: nft.id, <- nft)

                destroy nullNft
            }

            self.groupNftIds[groupId] = nftIds
            self.creatorToGroupMap[groupMetadata.originalContentCreator] = groupId;
            self.creatorProfileToGroupMap[groupMetadata.creatorProfile] = groupId;

            destroy nfts
        }

        pub fun getAllIds() : [UInt64] {
            return self.nfts.keys
        }

        pub fun getAllGroups() : [NftGroupData]{
            let groupData: [NftGroupData] = []

            for groupId in self.groupNftIds.keys {
                groupData.append(self.getGroupInfo(groupId))
            }

            return groupData
        }

        pub fun getGroupInfo(_ groupId: String) : NftGroupData {
            pre {
                self.groupNftIds[groupId] != nil : "No Nfts associated with group"
                self.groupMetadata[groupId] != nil : "No Metadata associated with group"
            }

            let nftIdGroup = self.groupNftIds[groupId]!
            let nftIds = nftIdGroup.keys

            return NftGroupData(
                groupId,
                nftIds,
                self.groupMetadata[groupId]!
            )
        }

        pub fun pickNfts(_ groupIds: [String]) : @[MoonNFT]{
            let pickedNfts : @[MoonNFT] <- []

            while groupIds.length > 0 {
                let groupId = groupIds.removeFirst()
                let nftIds = self.groupNftIds[groupId] ?? panic("Group with Id ".concat(groupId).concat(" does not exist"))

                let nftId = nftIds.remove(key: nftIds.keys[0])!
                // remove the nft Id from the group so that we know it no longer exists in this grouping
                let nft <- self.nfts.remove(key: nftId)!
                pickedNfts.append(<- nft)
            }

            return <- pickedNfts
        }

        destroy () {
            destroy self.nfts
        }
    }

    pub struct NftGroupData {
        pub let groupId : String
        pub let nftIds : [UInt64]
        pub let metadata : MoonNftData

        init (_ groupId: String, _ nftIds: [UInt64], _ metadata: MoonNftData) {
            self.groupId = groupId
            self.nftIds = nftIds
            self.metadata = metadata
        }
    }

    pub fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    init() {
        self.NFT_RECEIVER_PUBLIC_PATH = /public/NFTReceiver
        self.SELLER_CATALOG_PATH = /public/SellerCatalog
        self.QUERY_MINTED_COLLECTION_PATH = /public/QueryMintedCollection

        self.COLLECTION_STORAGE_PATH = /storage/MoonNFTCollection
        self.MINTER_STORAGE_PATH = /storage/NFTMinter
        self.SINGLE_PLATFORM_SELLER_PATH = /storage/PlatformSeller
        self.ADMIN_MINT_COLLECTION_PATH = /storage/AdminMintedCollection

        // setup Minting and collecting infrastructure
        self.account.save(<- create Collection(), to: self.COLLECTION_STORAGE_PATH)
        self.account.link<&{NFTReceiver}>(self.NFT_RECEIVER_PUBLIC_PATH, target: self.COLLECTION_STORAGE_PATH)
        self.account.save(<-create NFTMinter(), to: self.MINTER_STORAGE_PATH)

        // setup seller infrastructure
        self.account.save(<- create SinglePlatformSeller(), to: self.SINGLE_PLATFORM_SELLER_PATH)
        self.account.link<&{SellerCatalog}>(self.SELLER_CATALOG_PATH, target: self.SINGLE_PLATFORM_SELLER_PATH)

        // setup admin mint collection resource
        self.account.save(<- create AdminMintedCollection(), to: self.ADMIN_MINT_COLLECTION_PATH)
        self.account.link<&{QueryMintedCollection}>(self.QUERY_MINTED_COLLECTION_PATH, target: self.ADMIN_MINT_COLLECTION_PATH)
    }
}

