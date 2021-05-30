import script from "../../cadence/scripts/getAllPacksForSale.cdc";
import buildScriptRunner from "./buildScriptRunner";

const getAllPacksForSale = buildScriptRunner(script);

export default getAllPacksForSale;
