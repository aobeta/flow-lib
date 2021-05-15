import mintTransaction from "../../../cadence/transactions/mintMoonNft.cdc";
import * as sdk from "@onflow/sdk";
import * as fcl from "@onflow/fcl";
import { buildAuthorization } from "../../util/auth";
import { resolveProposerSequenceNumber } from "../../util/resolver";

export interface MoonNftData {
    mediaUrl: string;
    creator: string;
    creatorProfile: string;
    metadata: Record<string,string>;
}

export interface AuthAccountDetails {
    privateKey: string;
    publicKeyId: number;
    address: string;
}

export default async function mintMoonNft (nftData: MoonNftData, authAccount: AuthAccountDetails, node: string) {
    const {
        address,
        privateKey,
        publicKeyId
    } = authAccount;

    const authorization = buildAuthorization(address, publicKeyId, privateKey);

    const buildInteration = await sdk.build([
        sdk.transaction`${mintTransaction}`,
        sdk.proposer(authorization),
        sdk.payer(authorization),
        sdk.authorizations([authorization])
    ]);

    const pipedInteraction = await sdk.pipe(buildInteration, [
        sdk.resolveParams,
        sdk.resolveAccounts,
        sdk.resolveRefBlockId({ node }),
        resolveProposerSequenceNumber({ node }),
        sdk.resolveSignatures,
    ]);

    const transaction = await sdk.send(pipedInteraction, { node });

    return fcl.tx(transaction).onceSealed();
}
