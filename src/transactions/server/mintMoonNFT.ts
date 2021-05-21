import mintTransaction from "../../../cadence/transactions/mintMoonNFT.cdc";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { buildAuthorization } from "../../util/auth";
import { AuthAccountDetails } from "../../types/AuthAccount";
import { MoonNftData } from "../../types/Nft";

export interface MintMoonNftData {
    count: number,
    groupId: string,
    nftData : MoonNftData
}

export default async function mintMoonNft (
    inputNftData: MintMoonNftData,
    authAccount: AuthAccountDetails,
    node: string,
) {
    const {
        address,
        privateKey,
        publicKeyId
    } = authAccount;

    const {
        count,
        groupId,
        nftData,
    } = inputNftData;

    const {
        mediaUrl,
        creator,
        creatorProfile,
        metadata
    } = nftData

    const authorization = buildAuthorization(address, publicKeyId, privateKey);

    const buildMetadataDictionary = (data: Record<string,string>) => {
        return Object.keys(data)
            .map(key => ({
                key,
                value: data[key]
            }));
    }

    const transaction = await fcl.send([
        fcl.transaction`${mintTransaction}`,
        fcl.args([
            fcl.arg(mediaUrl, t.String),
            fcl.arg(creator, t.String),
            fcl.arg(creatorProfile, t.String),
            fcl.arg(
                buildMetadataDictionary(metadata),
                t.Dictionary({key: t.String, value: t.String})
            ),
            fcl.arg(groupId, t.String),
            fcl.arg(count, t.Int)
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
