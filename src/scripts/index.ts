import testScript from '../../cadence/transactions/mintMoonNFT.cdc';
import getAdminMintedNFTGroupInfo from './getAdminMintedNFTGroupInfo';
import getAllIds from './getIds';

export function RunTestScript() {
    console.log(testScript);
}

export {
    getAdminMintedNFTGroupInfo,
    getAllIds
}
// RunTestScript()
