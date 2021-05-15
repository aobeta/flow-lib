import { SHA3 } from "sha3";

export default function hash(message: string) {
    const sha = new SHA3(256);
    sha.update(Buffer.from(message, "hex"))
    return sha.digest()
}
