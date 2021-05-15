import * as sdk from "@onflow/sdk";

export const resolveProposerSequenceNumber = ({ node }) => async (ix) => {

    const response = await sdk.send(await sdk.build([
      sdk.getAccount(ix.accounts[ix.proposer].addr)
    ]), { node })
    const decoded = await sdk.decode(response)

    ix.accounts[ix.proposer].sequenceNum = decoded.keys[ix.accounts[ix.proposer].keyId].sequenceNumber

    return ix;
}
