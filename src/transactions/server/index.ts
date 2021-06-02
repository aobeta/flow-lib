
import mintMoonNft from "./mintMoonNft";
import publishNftPack from './publishNftPack';

import {config} from "@onflow/fcl";

export interface FlowConfig {
    contractAddress: string;
    accessNode: string;
}

export const initFlowConfig = (options: FlowConfig) => {
    config()
        .put("accessNode.api", options.accessNode)
        .put("0xMOON_NFT_CONTRACT", options.contractAddress)
}

export { signWithKey } from '../../util/auth';

export {
    mintMoonNft,
    publishNftPack
}
