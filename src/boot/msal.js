import { UserAgentApplication } from "msal";

const config = {
  auth: {
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
    authority: import.meta.env.VITE_AUTH_AUTHORITY,
    validateAuthority: import.meta.env.VITE_AUTH_VALIDATE_AUTHORITY == 'true',
    redirectUri: import.meta.env.VITE_AUTH_REPLY_URL
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  }
}

function authCallback(error, response) {
  if (error) {
    console.error(error);
    if (error.errorMessage.indexOf("AADB2C90118") > -1) {
      // password reset requested
      localStorage.clear();
      msalInstance.authority = import.meta.env.VITE_AUTH_AUTHORITY_PASSWORD_RESET;
    } else if (error.errorMessage.indexOf("AADB2C90091") > -1) {
      // cancel login requested
      localStorage.clear();
      window.location.href = "";
    }
  } else {
    if (response && response.idToken && response.idToken.objectId) {
      localStorage.setItem("user-info", JSON.stringify(response.idToken));
      localStorage.setItem("user-info-name", response.idToken.claims.name);
    }
  }
}

const msalInstance = new UserAgentApplication(config);
msalInstance.handleRedirectCallback(authCallback);



export { msalInstance };
