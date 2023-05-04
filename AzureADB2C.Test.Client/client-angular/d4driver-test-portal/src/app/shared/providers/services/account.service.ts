import { Inject, Injectable } from "@angular/core";
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from "@azure/msal-angular";
import { EventMessage, InteractionStatus, AuthenticationResult, AccountInfo, SsoSilentRequest, RedirectRequest, PopupRequest, InteractionType, EventType } from "@azure/msal-browser";
import { Subject, filter, takeUntil } from "rxjs";
import { environment } from "src/environments/environment";
import { IdTokenClaims, PromptValue } from '@azure/msal-common'
type IdTokenClaimsWithPolicyId = IdTokenClaims & {
    acr?: string,
    tfp?: string,
};

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    private readonly _destroying$ = new Subject<void>();
    isIframe = false;
    loginDisplay = false;
    claims: any[] | null = [];
    constructor(@Inject(MSAL_GUARD_CONFIG) private readonly _msalGuardConfig: MsalGuardConfiguration,
        private readonly _authService: MsalService,
        private readonly _msalBroadcastService: MsalBroadcastService) {
    }

    init(): void {
        this.isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal
        this.setLoginDisplay();

        this._authService.instance.enableAccountStorageEvents(); // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
        this._msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.ACCOUNT_ADDED || msg.eventType === EventType.ACCOUNT_REMOVED),
            )
            .subscribe((result: EventMessage) => {
                if (this._authService.instance.getAllAccounts().length === 0) {
                    window.location.pathname = "/";
                } else {
                    this.setLoginDisplay();
                }
            });

        this._msalBroadcastService.inProgress$
            .pipe(
                filter((status: InteractionStatus) => status === InteractionStatus.None),
                takeUntil(this._destroying$)
            )
            .subscribe(() => {
                this.setLoginDisplay();
                this.checkAndSetActiveAccount();
                this.claims = this._getClaims(this._authService.instance.getActiveAccount()?.idTokenClaims as Record<string, any>);
            })

        this._msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS
                    || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
                    || msg.eventType === EventType.SSO_SILENT_SUCCESS),
                takeUntil(this._destroying$)
            )
            .subscribe((result: EventMessage) => {

                let payload = result.payload as AuthenticationResult;
                let idtoken = payload.idTokenClaims as IdTokenClaimsWithPolicyId;

                if (idtoken.acr === environment.b2cPolicies.names.signUpSignIn || idtoken.tfp === environment.b2cPolicies.names.signUpSignIn) {
                    this._authService.instance.setActiveAccount(payload.account);
                }

                /**
                 * For the purpose of setting an active account for UI update, we want to consider only the auth response resulting
                 * from SUSI flow. "acr" claim in the id token tells us the policy (NOTE: newer policies may use the "tfp" claim instead).
                 * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
                 */
                if (idtoken.acr === environment.b2cPolicies.names.editProfile || idtoken.tfp === environment.b2cPolicies.names.editProfile) {

                    // retrieve the account from initial sing-in to the app
                    const originalSignInAccount = this._authService.instance.getAllAccounts()
                        .find((account: AccountInfo) =>
                            account.idTokenClaims?.oid === idtoken.oid
                            && account.idTokenClaims?.sub === idtoken.sub
                            && ((account.idTokenClaims as IdTokenClaimsWithPolicyId).acr === environment.b2cPolicies.names.signUpSignIn
                                || (account.idTokenClaims as IdTokenClaimsWithPolicyId).tfp === environment.b2cPolicies.names.signUpSignIn)
                        );

                    let signUpSignInFlowRequest: SsoSilentRequest = {
                        authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
                        account: originalSignInAccount
                    };

                    // silently login again with the signUpSignIn policy
                    this._authService.ssoSilent(signUpSignInFlowRequest);
                }

                /**
                 * Below we are checking if the user is returning from the reset password flow.
                 * If so, we will ask the user to reauthenticate with their new password.
                 * If you do not want this behavior and prefer your users to stay signed in instead,
                 * you can replace the code below with the same pattern used for handling the return from
                 * profile edit flow (see above ln. 74-92).
                 */
                if (idtoken.acr === environment.b2cPolicies.names.resetPassword || idtoken.tfp === environment.b2cPolicies.names.resetPassword) {
                    let signUpSignInFlowRequest: RedirectRequest | PopupRequest = {
                        authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
                        scopes: [...environment.apiConfig.scopes],
                        prompt: PromptValue.LOGIN // force user to reauthenticate with their new password
                    };

                    this.login(signUpSignInFlowRequest);
                }

                return result;
            });

        this._msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_FAILURE || msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE),
                takeUntil(this._destroying$)
            )
            .subscribe((result: EventMessage) => {
                // Check for forgot password error
                // Learn more about AAD error codes at https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes
                if (result.error && result.error.message.indexOf('AADB2C90118') > -1) {
                    let resetPasswordFlowRequest: RedirectRequest | PopupRequest = {
                        authority: environment.b2cPolicies.authorities.resetPassword.authority,
                        scopes: [],
                    };

                    this.login(resetPasswordFlowRequest);
                };
            });
    }
    setLoginDisplay(): void {
        this.loginDisplay = this._authService.instance.getAllAccounts().length > 0;
    }

    checkAndSetActiveAccount(): void {
        /**
         * If no active account set but there are accounts signed in, sets first account to active account
         * To use active account set here, subscribe to inProgress$ first in your component
         * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
         */
        let activeAccount = this._authService.instance.getActiveAccount();

        if (!activeAccount && this._authService.instance.getAllAccounts().length > 0) {
            let accounts = this._authService.instance.getAllAccounts();
            this._authService.instance.setActiveAccount(accounts[0]);
        }
    }

    loginRedirect(): void {
        if (this._msalGuardConfig.authRequest) {
            this._authService.loginRedirect({ ...this._msalGuardConfig.authRequest } as RedirectRequest);
        } else {
            this._authService.loginRedirect();
        }
    }

    login(userFlowRequest?: RedirectRequest | PopupRequest): void {
        if (this._msalGuardConfig.interactionType === InteractionType.Popup) {
            if (this._msalGuardConfig.authRequest) {
                this._authService.loginPopup({ ...this._msalGuardConfig.authRequest, ...userFlowRequest } as PopupRequest)
                    .subscribe((response: AuthenticationResult) => {
                        this._authService.instance.setActiveAccount(response.account);
                    });
            } else {
                this._authService.loginPopup(userFlowRequest)
                    .subscribe((response: AuthenticationResult) => {
                        this._authService.instance.setActiveAccount(response.account);
                    });
            }
        } else {
            if (this._msalGuardConfig.authRequest) {
                this._authService.loginRedirect({ ...this._msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
            } else {
                this._authService.loginRedirect(userFlowRequest);
            }
        }
    }

    logout(): void {
        if (this._msalGuardConfig.interactionType === InteractionType.Popup) {
            this._authService.logoutPopup({
                mainWindowRedirectUri: "/"
            });
        } else {
            this._authService.logoutRedirect();
        }
    }

    editProfile(): void {
        let editProfileFlowRequest: RedirectRequest | PopupRequest = {
            authority: environment.b2cPolicies.authorities.editProfile.authority,
            scopes: [],
        };

        this.login(editProfileFlowRequest);
    }

    onDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }

    _getClaims(claims: Record<string, any>): {
        id: number;
        claim: string;
        value: unknown;
    }[] | null {
        if (claims) {
            return Object.entries(claims).map((claim: [string, unknown], index: number) => ({ id: index, claim: claim[0], value: claim[1] }));
        };
        return null;
    }
}