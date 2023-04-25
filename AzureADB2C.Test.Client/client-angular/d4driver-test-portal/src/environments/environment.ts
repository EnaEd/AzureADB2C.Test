export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: "317f9f48-084e-464c-887a-9c500949834c",
    }
  },
  apiConfig: {
    scopes: ["https://testd4drivers.onmicrosoft.com/d4driverstesttask-api/tasks.read"],
    uri: "https://localhost:6001/hi"
  },
  b2cPolicies: {
    names: {
      signUpSignIn: "B2C_1_D4DriversWithMSA",
      resetPassword: "",
      editProfile: "B2C_1_D4DriversTestWithMSAEditProfile"
    },
    authorities: {
      signUpSignIn: {
        authority: "https://testd4drivers.b2clogin.com/testd4drivers.onmicrosoft.com/B2C_1_D4DriversWithMSA/"
      },
      resetPassword: {
        authority: ""
      },
      editProfile: {
        authority: "https://testd4drivers.b2clogin.com/testd4drivers.onmicrosoft.com/B2C_1_D4DriversTestWithMSAEditProfile/"
      }
    },
    authorityDomain: "testd4drivers.b2clogin.com"
  }
};

