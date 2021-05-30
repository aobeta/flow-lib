import * as sdk from "@onflow/sdk";
import * as t from "@onflow/types";

const buildScriptRunner = (script: string) => {
    return async (contractAddress : string, node: string) => {
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
    };
}

export default buildScriptRunner;
