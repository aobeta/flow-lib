import TheMoonNFTContract from 0xf8d6e0586b0a20c7

pub fun main () : [TheMoonNFTContract.NftGroupData] {
    let moonPublicAccount = getAccount(0xf8d6e0586b0a20c7)

    let queryCapability = moonPublicAccount.getCapability<&{TheMoonNFTContract.QueryMintedCollection}>(TheMoonNFTContract.QUERY_MINTED_COLLECTION_PATH)
    let query = queryCapability.borrow()!

    let nftGroupData = query.getAllGroups()

    return nftGroupData
}
