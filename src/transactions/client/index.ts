import {config} from "@onflow/fcl";

interface ClientSideConfig {
    walletDiscroveryUrl: string;
    platformSmartContractAddress: string;
    accessNode: string;
}

export const initFlowConfigClient = (options: ClientSideConfig) => {
    config()
        .put("challenge.handshake", options.walletDiscroveryUrl)
        .put("0xMOON_NFT_CONTRACT", options.platformSmartContractAddress)
        .put("accessNode.api", options.accessNode);
}
