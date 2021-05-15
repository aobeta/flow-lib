import { ec } from "elliptic";
import hash from "./hash";

export interface TransactionData {
    message : string
}

export interface TransactionAccountDetails {
    kind: "Account",
    tempId: string | null,
    addr: string | null,
    keyId: number | null,
    sequenceNum: number | null,
    signature: string | null,
    signingFunction: (data: TransactionData) => Pick<TransactionAccountDetails, 'addr' | 'keyId' | 'signature'>,
    resolve: null,
    role: {
        proposer: boolean,
        authorizer: boolean,
        payer:  boolean,
        param:  boolean
    }
}

export function signWithKey(message: string, privateKey: string) {
    const key = new ec('p256').keyFromPrivate(Buffer.from(privateKey, "hex"));
    const sig = key.sign(hash(message));
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);
    return Buffer.concat([r, s]).toString("hex");
}

export const buildAuthorization = (accountAddress: string, publicKeyId: number, privateKey: string) : (account: TransactionAccountDetails) => TransactionAccountDetails => (
    account: TransactionAccountDetails
  ) => ({
    ...account,
    tempId: accountAddress,
    addr: accountAddress,
    keyId: publicKeyId,
    resolve: null,
    signingFunction: (data: TransactionData) => {
      return {
        addr: accountAddress,
        keyId: publicKeyId,
        signature: signWithKey(data.message, privateKey),
      };
    },
  });
