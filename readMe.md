# Authentification with microsoft graph API and nodejs

In this tutoriel we want to learn we can get idtoken from user using Asure Active Directoty.

For this tutoriel we need some knowledges:

- [nodejs](https://nodejs.org/en) to run server

- [microsoft account](https://account.microsoft.com/account) to create app register from [azure portail](https://portal.azure.com/)
- express library : to listing incoming request from server.

- @azure/msal-node library : to connect express server to azure portail and acquire idToken from user
- dotenv library: to set environment variables that will be use inside of application

- nodemon library : to restart application automatically when javascript files changes

In the next line let's init node application and install require libraries.
<br/>
<br/>

# Init node application

To init node application we need to use some command from npm(it is the tool to manage library from nodejs).

```cmd
# to init application
npm init --yes

# installl all libraries dependance
npm i express @azure/msal-node dotenv --save

# install nodemon in development mode
npm i nodemon -D
```

All command above must be run step by step to install each dependance.

in the next section we will create and setup an application in azure portail with azure active directory.<br><br>

# Usage

```cmd
# install dependances
npm i or npm install

# run app
npm run start
```

# Create application in azure active directory

This is the step to create application in azure active directory

- Authentication into azure portal with microsoft account

- In front of you click on icon `Azure active directory`

- In the left side bar choose the `app registration`

- In front of you click on `new registration`

- In front of you, enter :

  - the application name,in our case you will call him `web_app`

  - select the support account types : for this tutoriel we will take `Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox` to provide large possiblity from use to signin into your application
  - Redirect URI (optional) : enter the url redirection to receive `idToken` after signin of users. in our case we will enter : `http://localhost:3000/redirect`.

  - press register button to save all informations enter and selected

After the validation you will see the information of your account,then you will save two informations:

- clientId : the ID of your application

- tenantId : the ID from owner of account

In next the step we will create a clientSecret which is the secret key from user to authentication. <br/><br/>

# setup application created

for do that we must;

- Click on `certificates & secret`

- In front of you, click on `new client`

- In the right sidebar enter the description and choose the timelife of `clientSecret`.<br/>
  then click on `Add` button to active generation of client secret,after this action, you will see the new client secret. Copy his value and keep it in a file.

In the next section you will set the permissions to access to data of user, let's do that.

- First you need to click on `app registers` in the left sidebar.

- After it select the application that we want to set permissions, in our case it is `web_app`.

- In front of you,click on `Add permision`

- on the right sidebar click on `mricrosoft graph`

- you will see two propositions:

  - `delegated permission`: this option is use to access by signed-in user. it is our choice.

  - `Application permission ` : use to other application,generaly for application who run on the background or daemon without signed-in user. it is not our choice

- there,click `delegated permission` and you will see a list of choice,select the permission that you want, in our case we will select `Mail.read` because we want to access on email of user. the default value is `User.red`,if not exists add it. After click on `Add permissions` to save permissions.

In the next session we will implement code. we will have 3 steps above :

- First, get the url redirection provider by api through `@azure/msal-node`.

- Second , after receive url from API, we redirect user to microsoft service authentication to authenticate user with credentials.

- Transition : during authentication of user, we have to issues:

  - success: in this case API will be redirect user from the initial page when authentication had been began first, in our case we will take `http://localhost:3000`.

  - failed: in this case API will be redirect user from the initial page when authentication had been began first, in our case we will take `http://localhost:3000/redirect/`.

- Third, if user is login successfully, we will receive the `idToken` through `@azure/msal-node` then we can use this idToken to our need.<br/><br/>

Like describe above we will see each step with code to perform all informations receive.

let's begin:<br/><br/>

# Explaim all code step by step

```javascript
#app.js

// load dotenv lybrary to access on environment varibles

require("dotenv").config();

// require all necessary labrary

const express = require("express");
const app = express();
const url = require("url");
const { ConfidentialClientApplication } = require("@azure/msal-node");
const PORT = process.env.PORT || 3000;

// auth configuration to get urlRedirect from API

const authConfig = {
  auth: {
    clientId: process.env.CLIENT_ID,// clientID keep from azure cloud
    authority: process.env.AUTHORITY,// url to authorization of user authenticated
    clientSecret: process.env.CLIENT_SECRET, // clientSecret keep from azure cloud
  },
};

// request seeting to get idToken

const request = {
  scopes: ["User.read"],// permissions add in application since azure microsolft
  redirectUri: process.env.REDIRECT_URI, // redirect uri set on azure cloud for app,it must be the same like redirect uri from azure cloud,otherwise authentification will be failed
};

// create a client to contact remote ÂPI

const client = new ConfidentialClientApplication(authConfig);

// route to init authentication of user

app.get("/", async (req, res) => {
  try {
    // if authentication is successfully like see below API will be redirect to init pasge in these case,we will redirect user to redirect url to manage request

    if (req.query.code) {
      return res.redirect(
        url.format({ pathname: "/redirect", query: req.query })
      );
    }
    // if user is not authenticate,then get url and redirect him to redirect page to manage his data
    let authUrl = await client.getAuthCodeUrl(request);
    res.redirect(authUrl);
  } catch (error) {
    console.error(error);
  }
});

// redirect url to manage user request

app.get("/redirect", async (req, res) => {
    try {
        // when user is login from API, he is redirect here and we get his token

        let { account } = await client.acquireTokenByCode({ ...request, code: req.query.code }, { code: req.query.code })
        let { username } = account

        //successfully authentication

        res.status(200).send({ message: "token has been acquired successfully", username })
    } catch (error) {

        // post error when error occured during authentication
        res.status(500).send(error)
    }
})

// listen server runing

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
```

Thank you for you attention,have a best day cordialy.
