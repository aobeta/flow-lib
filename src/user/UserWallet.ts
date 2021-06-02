import * as fcl from "@onflow/fcl";
import DeferredPromise from "../util/DeferredPromise";
import initializeAccountTransaction from '../../cadence/transactions/initializeUserAccount.cdc';
import { buildAuthorizationClientSide } from '../util/auth';

interface WalletUser {
    addr: string | null;
    cid: string | null;
    expiresAt: string | null;
    loggedIn: boolean | null
}

const DEFAULT_WALLET_USER_STATE = {
    addr: null,
    cid: null,
    expiresAt: null,
    loggedIn: null,
};

interface PlatformAccountConfig {
    platformAccount: string,
    accountPublicKeyId: number,
    signingFunction: (message: string) => Promise<string>;
}

export default class UserWallet {
    private user : WalletUser;
    private walletInitialized = false;
    private initializedDeferredPromise = new DeferredPromise<void>();

    constructor (private walletAddress?: string) {
        if (walletAddress != null) {
            this.subscribeToUser();
            this.user = DEFAULT_WALLET_USER_STATE;
        }
    }

    private subscribeToUser () {
        // rxjs context has different "this" hence why we use bind() here
        fcl.currentUser().subscribe(this.onUserInfoReceived.bind(this));
    }

    /**
     *
     * @returns a promise that resolves if the wallet was successfully initialized with address from constructor.
     */
    onInitialized () {
        return this.initializedDeferredPromise.promise;
    }

    private onUserInfoReceived (userInfo: WalletUser) {
        if (!this.walletInitialized) {
            this.walletInitialized = true;

            if (this.walletAddress != null && userInfo.addr !== this.walletAddress) {
                this.initializedDeferredPromise.reject("Wallet Address Mismatch");
            }
            else {
                this.user = userInfo;
                this.initializedDeferredPromise.resolve();
            }
        }
        else {
            // previously initialized. Just continue to update user info as it is received.
            this.user = userInfo;
        }
    }

    /**
     *
     * @returns true if user is logged in. else returns false.
     */
    logIn () {
        return fcl
            .logIn()
            .then((userInfo : WalletUser) => (userInfo.addr === this.walletAddress));
    }

    async signUp (accountConfig: PlatformAccountConfig) : Promise<{ isInitialized: boolean; user: WalletUser}> {
        this.subscribeToUser();
        await fcl.unauthenticate();
        const userInfo = await fcl.logIn();
        this.user = userInfo;

        const returnData = {
            user: userInfo,
            isInitialized: false
        };

        if (this.isLoggedIn()) {
            try {
                console.log('about to initialize');
                await this.initializeAccount(accountConfig);
                return {
                    ...returnData,
                    isInitialized: true,
                };
            }
            catch(error) {
                console.error("INITIALIZE ERROR :: ", error);
                return returnData;
            }
        }

        return returnData;
    }

    isLoggedIn () {
        return this.user.loggedIn != null && this.user.loggedIn === true;
    }

    isUserWalletInitialized () {
        // fcl.
    }

    /**
     * Initializes a users account with the nft receiver so that they can receive NFT's
     */
    async initializeAccount (accountConfig: PlatformAccountConfig) {
        const {
            accountPublicKeyId,
            platformAccount,
            signingFunction
        } = accountConfig;

        const txId = await fcl.send([
            fcl.transaction`${initializeAccountTransaction}`,
            fcl.payer(buildAuthorizationClientSide(platformAccount, accountPublicKeyId, signingFunction)),
            fcl.proposer(buildAuthorizationClientSide(platformAccount, accountPublicKeyId, signingFunction)),
            fcl.authorizations([fcl.authz]),
            fcl.limit(100)
        ]);

        console.log('transaction Id : ', txId);
        const finishedTransaction = await fcl.tx(txId).onceSealed();
        console.log('transaction : ', finishedTransaction);
    }
}


