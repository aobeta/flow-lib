import * as fcl from "@onflow/fcl";
import DeferredPromise from "../util/DeferredPromise";

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

            if (userInfo.addr !== this.walletAddress) {
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

    async signUp () : Promise<WalletUser> {
        this.subscribeToUser();
        return fcl.logIn();
    }

    isLoggedIn () {
        console.log("user :: ", this.user);
        return this.user.loggedIn != null && this.user.loggedIn === true;
    }

    linkMoonWallet () {

    }
}


