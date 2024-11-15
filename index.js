import fcl from "@onflow/fcl";
import t from "@onflow/types";
import * as sdk from "@onflow/sdk";
import * as sha3 from "sha3";
import elliptic from "elliptic";

const { ec } = elliptic;

fcl.config()
  .put("accessNode.api", "http://localhost:8080")

console.log("PAST CONFIG");

const contract = `
pub contract Foo {
  pub fun woot(rawr: String) {
    log(rawr)
  }
}
`;

const CODE = Buffer.from(contract, "utf8").toString("hex")

console.log("BEFORE SEND : ", sdk);

function hash(message) {
    const sha = new sha3.SHA3(256);
    sha.update(Buffer.from(message, "hex"))
    return sha.digest()
}

function signWithKey(message) {
    // console.log("ARGS --> ", arguments);
    // const key = new ec('p256').keyFromPrivate(Buffer.from("5b6132018902ee501e708567a5c074a6a77b343d693da11f8dc75c7a060dfef2", "hex"));
    const key = new ec('p256').keyFromPrivate(Buffer.from("30e99aed97fe2135cfb35c89731543410d605612959cf460ff1efd67632bc5c6", "hex"));
    const sig = key.sign(hash(message));
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);
    return Buffer.concat([r, s]).toString("hex");
}

const buildAuthorization = () => (
    account
  ) => ({
    ...account,
    tempId: "0xf8d6e0586b0a20c7",
    addr: "0xf8d6e0586b0a20c7",
    keyId: 0,
    resolve: null,
    signingFunction: (data) => {
      return {
        addr: "0xf8d6e0586b0a20c7",
        keyId: 0,
        signature: signWithKey(data.message),
      };
    },
  });

// const resolveProposerSequenceNumber = ({ node }) => async (ix) => {

//     const response = await sdk.send(await sdk.build([
//       sdk.getAccount(ix.accounts[ix.proposer].addr)
//     ]), { node })
//     const decoded = await sdk.decode(response)

//     ix.accounts[ix.proposer].sequenceNum = decoded.keys[ix.accounts[ix.proposer].keyId].sequenceNumber

//     return ix;
// }

// fcl
//   .send([
//     fcl.script`
//     pub fun main(address: Address) {
//         let account = getAccount(address)
//         log(account.storageUsed)
//         log(account.storageCapacity)
//     }
//     `,
//     fcl.args([
//       fcl.arg( "0xf8d6e0586b0a20c7", t.Address)
//     ])
//   ])
//   .then(fcl.decode)
//   .then(result => console.log('Result :: ', result))


// sdk.build([
//   sdk.transaction`
//     transaction {
//         let account: AuthAccount

//         prepare(acct: AuthAccount) {
//             self.account = acct
//         }

//         post {
//             self.account != nil : "Account was not initialized"
//         }
//     }
//   `,
//   sdk.proposer(buildAuthorization()),
//   sdk.payer(buildAuthorization()),
//   sdk.authorizations([buildAuthorization()]),
// ])
// .then(build => sdk.pipe(build, [
//     sdk.resolveParams,
//     sdk.resolveAccounts,
//     sdk.resolveRefBlockId({ node: "http://localhost:8080" }),
//     resolveProposerSequenceNumber({ node: "http://localhost:8080" }),
//     sdk.resolveSignatures,
// ]))
// .then((pipedBuild) => {
//     console.log('piped build :: ', pipedBuild)
//     return sdk.send(pipedBuild, { node: "http://localhost:8080" } )
// })
// .then(txId => {
//     console.log(`Transaction Id : `, txId)
//     return fcl.tx(txId).onceSealed();
// })
// .then(tx => console.log('Transaction Sealed :: ', tx))
// .catch(error => console.error(error))


// 🔴️ Store private key safely and don't share with anyone!
// Private Key 	 8b1150fcfd1e2d75d4155f6e59c1f456d7efeefc5ad4b6137bcf833371953cd6
// Public Key 	 041240a50c93ff582ab7c7249c28b8ec12bc2b2d09576e1bbc6ec0be42c43147e684a2820636021d89c3ff22f86bf6959314ac80f9370dbbecfc0f2e95ac3e22

