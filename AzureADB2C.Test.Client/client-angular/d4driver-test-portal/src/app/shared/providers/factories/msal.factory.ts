import { MsalInterceptorConfiguration, MsalGuardConfiguration } from "@azure/msal-angular";
import { BrowserCacheLocation, InteractionType, LogLevel, PublicClientApplication } from "@azure/msal-browser";
import { IPublicClientApplication } from "@azure/msal-browser/dist/app/IPublicClientApplication";
import { environment } from "src/environments/environment";

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;
export function loggerCallback(logLevel: LogLevel, message: string) {
    console.log(message);
  }
  
export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication({
      auth: {
        clientId: environment.msalConfig.auth.clientId,
        authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
        redirectUri: '/',
        postLogoutRedirectUri: '/',
        knownAuthorities: [environment.b2cPolicies.authorityDomain]
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: isIE, // set to true for IE 11
      },
      system: {
        allowNativeBroker: false, // Disables WAM Broker
        loggerOptions: {
          loggerCallback,
          logLevel: LogLevel.Verbose,
          piiLoggingEnabled: false
        }
      }
    });
  }

  export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>();
  
    protectedResourceMap.set(environment.apiConfig.uri, environment.apiConfig.scopes);
  
    return {
      interactionType: InteractionType.Redirect,
      protectedResourceMap
    };
  }
  
  export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
      interactionType: InteractionType.Redirect,
      authRequest: {
        scopes: [...environment.apiConfig.scopes],
      },
      loginFailedRoute: '/login-failed'
    };
  }