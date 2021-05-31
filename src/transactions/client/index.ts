import {config} from "@onflow/fcl";

interface ClientSideConfig {
    walletDiscroveryUrl: string;
}

export const initFlowConfigClient = (options: ClientSideConfig) => {
    config()
        .put("challenge.handshake", options.walletDiscroveryUrl)
}
