import TheMoonNFTContract from 0xf8d6e0586b0a20c7

pub fun main (contractAddress: Address) : [UInt64] {
    let moonPublicAccount = getAccount(contractAddress)

    let queryCapability = moonPublicAccount.getCapability<&{TheMoonNFTContract.QueryMintedCollection}>(TheMoonNFTContract.QUERY_MINTED_COLLECTION_PATH)
    let query = queryCapability.borrow()!

    let nftGroupData = query.getAllIds()

    return nftGroupData
}
