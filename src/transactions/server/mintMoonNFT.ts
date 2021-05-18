import mintTransaction from "../../../cadence/transactions/mintMoonNFT.cdc";
import * as sdk from "@onflow/sdk";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { buildAuthorization } from "../../util/auth";
import { resolveProposerSequenceNumber } from "../../util/resolver";
import {resolveCadence} from "@onflow/sdk-resolve-cadence";
import {config} from "@onflow/fcl";

export interface MintMoonNftData {
    count: number,
    groupId: string,
    nftData : {
        mediaUrl: string;
        creator: string;
        creatorProfile: string;
        metadata: Record<string,string>;
    }
}

export interface AuthAccountDetails {
    privateKey: string;
    publicKeyId: number;
    address: string;
}

export default async function mintMoonNft (inputNftData: MintMoonNftData, authAccount: AuthAccountDetails, node: string) {
    console.log(mintTransaction)
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

    console.log("set access node in config this time !")
    // const buildInteration = await sdk.build([
    //     sdk.transaction`${mintTransaction}`,
    //     sdk.args([
    //         sdk.arg(mediaUrl, t.String),
    //         sdk.arg(creator, t.String),
    //         sdk.arg(creatorProfile, t.String),
    //         sdk.arg(
    //             buildMetadataDictionary(metadata),
    //             t.Dictionary({key: t.String, value: t.String})
    //         ),
    //         sdk.arg(groupId, t.String),
    //         sdk.arg(count, t.Int)
    //     ]),
    //     sdk.proposer(authorization),
    //     sdk.payer(authorization),
    //     sdk.authorizations([authorization]),
    //     sdk.limit(100)
    // ]);


    // const pipedInteraction = await sdk.pipe(buildInteration, [
    //     resolveCadence,
    //     sdk.resolveArguments,
    //     sdk.resolveAccounts,
    //     sdk.resolveRefBlockId({ node }),
    //     resolveProposerSequenceNumber({ node }),
    //     sdk.resolveSignatures,
    // ]);

    // console.log("PIPED interaction : ", pipedInteraction)
    // const transaction = await sdk.send(pipedInteraction, { node });

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
        fcl.limit(9999)
    ], { node })
    .then(fcl.decode)

    console.log("TRANSACTION :: ", transaction);

    return fcl.tx(transaction).onceSealed();
}
