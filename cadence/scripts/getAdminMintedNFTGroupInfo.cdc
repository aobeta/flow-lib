import TheMoonNFTContract from 0xf8d6e0586b0a20c7

pub fun main (accountAddress: Address) : [TheMoonNFTContract.NftGroupData] {
    let moonPublicAccount = getAccount(accountAddress)

    let queryCapability = moonPublicAccount.getCapability<&{TheMoonNFTContract.QueryMintedCollection}>(TheMoonNFTContract.QUERY_MINTED_COLLECTION_PATH)
    let query = queryCapability.borrow() ?? panic("could not borrow QueryMintedCollection")

    let nftGroupData = query.getAllGroups()

    return nftGroupData
}
