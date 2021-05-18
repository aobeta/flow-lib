import script from "../../cadence/scripts/getAllIds.cdc";
import * as sdk from "@onflow/sdk";
import * as t from "@onflow/types";

const getAllIds = async (contractAddress : string, node: string) => {
    const buildInteraction = await sdk.build([
        sdk.script`${script}`,
        sdk.args([
            sdk.arg(contractAddress, t.Address)
        ])
    ]);

    const pipedInteraction = await sdk.pipe(buildInteraction, [
        sdk.resolveArguments,
    ]);

    const result = await sdk.send(pipedInteraction, { node });

    return sdk.decode(result);
}

export default getAllIds;
