import TheMoonNFTContract from 0xf8d6e0586b0a20c7

pub fun main (accountAddress: Address): [TheMoonNFTContract.MoonNftPackData] {
    let moonPublicAccount = getAccount(accountAddress)

    let sellerCatalogCapability = moonPublicAccount.getCapability<&{TheMoonNFTContract.SellerCatalog}>(TheMoonNFTContract.SELLER_CATALOG_PATH)
    let sellerCatalog = sellerCatalogCapability.borrow() ?? panic("Could not borrow seller catalog")

    return sellerCatalog.getAllPacks()
}
