import publishTransaction from "../../../cadence/transactions/publishNftPack.cdc";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { MoonNftPackData } from "../../types/Nft";
import { AuthAccountDetails } from "../../types/AuthAccount";
import { buildAuthorization } from "../../util/auth";

export interface PublishNftData {
    groupIds: string[];
    packData: MoonNftPackData;
}

export default async function publishNftPack(
    inputData: PublishNftData,
    authAccount: AuthAccountDetails,
    node: string,
) {
    const {
        address,
        privateKey,
        publicKeyId
    } = authAccount;

    const {
        groupIds,
        packData,
    } = inputData;

    const authorization = buildAuthorization(address, publicKeyId, privateKey);

    const transaction = await fcl.send([
        fcl.transaction`${publishTransaction}`,
        fcl.args([
            fcl.arg(groupIds, t.Array(t.String)),
            fcl.arg(packData.previewMediaUrl, t.String),
            fcl.arg(packData.creator, t.Optional(t.String)),
            fcl.arg(packData.creatorProfile, t.Optional(t.String))
        ]),
        fcl.proposer(authorization),
        fcl.payer(authorization),
        fcl.authorizations([authorization]),
        fcl.limit(9999) // still not sure what to set this value to
    ], { node })
    .then(fcl.decode);

    console.log("TRANSACTION :: ", transaction);

    return fcl.tx(transaction).onceSealed();
}
