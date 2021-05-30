import testScript from '../../cadence/transactions/mintMoonNFT.cdc';
import getAdminMintedNFTGroupInfo from './getAdminMintedNFTGroupInfo';
import getAllPacksForSale from './getAllPacksForSale';
import getAllIds from './getIds';

export function RunTestScript() {
    console.log(testScript);
}

export {
    getAdminMintedNFTGroupInfo,
    getAllPacksForSale,
    getAllIds
}
// RunTestScript()
