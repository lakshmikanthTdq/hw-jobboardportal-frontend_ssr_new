import {
  AuthenticationDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";


const userPoolId = process.env.REACT_APP_USERPOOL_ID
const clientId = process.env.REACT_APP_CLIENT_ID


let currentUser;
let userPool;
// initUserSession();

// userPool = new CognitoUserPool(poolData)
// currentUser = userPool.getCurrentUser()
// const session = JSON.parse(localStorage.getItem('userSession_jobboardportal'));

// if (session) {
//     if (currentUser) {
//         currentUser.setSignInUserSession(new CognitoUserSession(session));
//     }
// }

export function initUserSession() {
  if (typeof window === 'undefined') return;
  const poolData = {
    UserPoolId: userPoolId,
    ClientId: clientId,
    storage: window.sessionStorage,
  };
  userPool = new CognitoUserPool(poolData);
  currentUser = userPool.getCurrentUser();
  if (currentUser) {
    const accessToken = localStorage.getItem("accessToken_jobboardportal");
    const idToken = localStorage.getItem("idToken_jobboardportal");
    const refreshToken = localStorage.getItem("refreshToken_jobboardportal");
    const userSession = new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: idToken }),
      AccessToken: new CognitoAccessToken({ AccessToken: accessToken }),
      RefreshToken: new CognitoRefreshToken({ RefreshToken: refreshToken }),
      ClockDrift: 0,
    });
    console.log(userSession);
    currentUser.setSignInUserSession(userSession);
  }
}

export function getCurrentUser() {
  return currentUser;
}

function getCognitoUser(username) {
  const userData = {
    Username: username,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);

  return cognitoUser;
}

export async function getSession() {
  if (!currentUser) {
    currentUser = userPool.getCurrentUser();
  }

  return new Promise(function (resolve, reject) {
    currentUser.getSession(function (err, session) {
      if (err) {
        reject(err);
      } else {
        resolve(session);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

export async function signUpUserWithEmail(username, password) {
  return new Promise(function (resolve, reject) {
    const attributeList = [
      new CognitoUserAttribute({
        Name: "email",
        Value: username,
      }),
    ];

    userPool.signUp(username, password, attributeList, [], function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

export async function verifyCode(username, code) {
  return new Promise(function (resolve, reject) {
    const cognitoUser = getCognitoUser(username);

    cognitoUser.confirmRegistration(code, true, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

export async function signInWithEmail(username, password, newPasswordRequired) {
  return new Promise(function (resolve, reject) {
    const authenticationData = {
      Username: username,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    currentUser = getCognitoUser(username);
    currentUser.authenticateUser(authenticationDetails, {
      onSuccess: async function (result) {
        console.log("auth success");
        const session = await getSession();
        if (session.isValid()) {
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.getIdToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();
          localStorage.setItem("accessToken_jobboardportal", accessToken);
          localStorage.setItem("idToken_jobboardportal", idToken);
          localStorage.setItem("refreshToken_jobboardportal", refreshToken);
        }
        initUserSession();
        resolve(result);
      },
      onFailure: function (err) {
        reject(err);
      },
      newPasswordRequired: newPasswordRequired,
    });
  }).catch((err) => {
    throw err;
  });
}

export function signOut() {
  if (currentUser) {
    currentUser.signOut();
  }
}

export async function getUserDetails() {
  const attributes = await getAttributes();
  if (attributes) {
    const user = {
      firstName: attributes.find((a) => a.Name === "given_name").Value,
      lastName: '', //attributes.find((a) => a.Name === "family_name").Value,
      email: attributes.find((a) => a.Name === "email").Value,
      userId: attributes.find((a) => a.Name === "sub").Value,
    };
    localStorage.setItem("jobboardportalGetAttributes", JSON.stringify(user));
    return user;
  } else {
    let getUserDetails = localStorage.getItem("jobboardportalGetAttributes");
    if (getUserDetails) {
      let details = JSON.parse(getUserDetails);
      const user = {
        firstName: details[0].firstName,
        lastName: '',
        email: details[0].email,
        userId: details[0].userId,
      };
      return user;
    } else {
      window.location = '/jobboardportal/jobfeed';
      signOut();
    }
    
  }
}

export async function getAttributes() {
  return new Promise(function (resolve, reject) {
    if (currentUser === null) reject("User session invalid");

    currentUser.getUserAttributes(function (err, attributes) {
      if (err) {
        reject(err);
      } else {
        resolve(attributes);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

export async function setAttribute(attribute) {
  return new Promise(function (resolve, reject) {
    const attributeList = [];
    const res = new CognitoUserAttribute(attribute);
    attributeList.push(res);

    currentUser.updateAttributes(attributeList, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

export async function sendCode(username) {
  return new Promise(function (resolve, reject) {
    const cognitoUser = getCognitoUser(username);

    if (!cognitoUser) {
      reject(`could not find ${username}`);
      return;
    }

    cognitoUser.forgotPassword({
      onSuccess: function (res) {
        resolve(res);
      },
      onFailure: function (err) {
        reject(err);
      },
    });
  }).catch((err) => {
    throw err;
  });
}

export async function forgotPassword(username, code, password) {
  return new Promise(function (resolve, reject) {
    const cognitoUser = getCognitoUser(username);

    if (!cognitoUser) {
      reject(`could not find ${username}`);
      return;
    }

    cognitoUser.confirmPassword(code, password, {
      onSuccess: function () {
        resolve("password updated");
      },
      onFailure: function (err) {
        sessionStorage.setItem("cognitoMsg_jobboardportal", err.message);
        reject(err);
      },
    });
  });
}

export async function changePassword(newPassword, oldPassword, username) {
  return new Promise(function (resolve, reject) {
    const authenticationData = {
      Username: username,
      Password: oldPassword,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (session) {
        cognitoUser.changePassword(
          oldPassword,
          newPassword,
          function (err, result) {
            if (err) {
              sessionStorage.setItem("cognitoMsg_jobboardportal", err.message);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      },
      onFailure: function (err) {
        console.log("Error authenticating user:", err);
      },
    });
  });
}

export async function completePasswordChallenge(newPassword, userAttr) {
  return new Promise(function (resolve, reject) {
    console.log(currentUser);
    currentUser.completeNewPasswordChallenge(newPassword, userAttr, {
      onFailure: function (err) {
        if (err) {
          reject(err);
        }
      },
      onSuccess: function (userSession) {
        currentUser.setSignInUserSession(userSession);
        resolve(currentUser);
      },
    });
  });
}

export async function refreshToken() {
  const Token = localStorage.getItem("refreshToken_jobboardportal");
  if (Token) {
    return new Promise(function (resolve, reject) {
      const refreshToken = new AuthenticationDetails.CognitoRefreshToken({
        RefreshToken: Token,
      });
      currentUser.refreshSession(refreshToken, (err, session) => {
        if (err) {
          console.error("Token refresh failed:", err);
          window.location = "/ats/login";
        } else {
          console.log(session);
          const accessToken = session.getAccessToken().getJwtToken();
          const idToken = session.getIdToken().getJwtToken();
          const refreshToken = session.getRefreshToken().getToken();
          localStorage.setItem("accessToken_jobboardportal", accessToken);
          localStorage.setItem("idToken_jobboardportal", idToken);
          localStorage.setItem("refreshToken_jobboardportal", refreshToken);
          console.log("Token refreshed successfully:", session);
          initUserSession();
        //   getUserDetails().then((userInfo) => {
        //     let USERId = { userId: userInfo.userId };
        //     getCustDetailsAsync(USERId)
        //   });
        }
      });
    });
  }
}
