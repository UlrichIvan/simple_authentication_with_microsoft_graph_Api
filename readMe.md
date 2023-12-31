# Authentification with microsoft graph API and nodejs

In this tutoriel we want to learn how can i get idtoken from user using Asure Active Directoty.

For this tutoriel we need some knowledges:

- [nodejs](https://nodejs.org/en) to run server

- [microsoft account](https://account.microsoft.com/account) to create app register from [azure portal](https://portal.azure.com/)
- `express` library : to listen incoming request to server.

- `@azure/msal-node` library : to connect express server to azure portal and acquire idToken from user
- `dotenv` library: to set environment variables that will be use inside of application

- `nodemon` library : to restart application automatically when javascript files changes

In the section let's init node application and install require libraries.
<br/>
<br/>

# Init node application(standalone,optional)

To init node application we need to use some commands from npm(it's the package manager for nodejs).

```cmd
# to init application

npm init --yes

# install all libraries dependance

npm i express @azure/msal-node dotenv --save

# install nodemon in development mode

npm i nodemon -D
```

All commands above must be run step by step to install each dependance.

in the next section we will create and setup an application in azure portal with azure active directory.<br><br>

# Usage

```cmd
# install dependances

npm i or npm install

# run app

npm run start
```

# Create application in azure active directory

This is the step to create application in azure active directory :

- Authentication into azure portal with microsoft account

- In front of you click on icon `Azure active directory`

- In the left sidebar choose the `app registration`

- In front of you click on `new registration`

- In front of you, enter :

  - the application name,in our case you will call him `web_app`

  - select the support account types : for this tutoriel we will take `Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox` to provide large possiblity from users to signin into your application

  - Redirect URI (optional) : enter the url redirection to receive `idToken` after signin of users. in our case we will enter : `http://localhost:3000/redirect/`.

  - press register button to save all informations entered and selected.

After the validation you will see the information of your account,then you will save two informations:

- clientId : the ID of your application

- tenantId : the ID from owner of account

In the next section we will create a `clientSecret` which is the secret key from user to authentication. <br/><br/>

# Setup application created

For do that we must;

- Click on `certificates & secret`

- In front of you, click on `new client`

- In the right sidebar enter the description and choose the timelife of `clientSecret`.<br/>
  then click on `Add` button to active generation of client secret,after this action, you will see the new client secret. Copy his value and keep it in a file.

In the next section you will set the permissions to access to data of user, let's do that.

- First you need to click on `app registers` in the left sidebar.

- After, select the application that we want to set permissions, in our case it is `web_app`.

- In front of you,click on `Add permision`

- on the right sidebar click on `mricrosoft graph`

- you will see two propositions:

  - `delegated permission`: this option is use to access by signed-in user. it is our choice.

  - `Application permission ` : use to other application,generaly for application who run on the background or daemon without signed-in user. it is not our choice

- then, click `delegated permission` and you will see a list of choices,select the permission that you want, in our case we will select `Mail.read` because we want to access on email of user. the default value is `User.read`,if not exists add it. After click on `Add permissions` to save permissions.

In the next session we will implement code. we will have 3 steps above :

- First, get the url redirection provider by api through `@azure/msal-node`.

- Second , after receive url from API, we redirect user to microsoft service authentication to authenticate user with credentials.

- Transition : during authentication of user, we have to issues:

  - success: in this case API will be redirect user from the initial page when authentication had began first, in our case we will take `http://localhost:3000`.

  - failed: in this case API will be redirect user from the initial page when authentication had been began first, in our case we will take `http://localhost:3000/redirect/`.

- Third, if user is login successfully, we will receive the `idToken` through `@azure/msal-node` then we can use this idToken to our need.<br/><br/>

Like describe above we will see each step with code to perform all informations receive.

let's begin:<br/><br/>

# All code step by step

```javascript
#app.js

require("dotenv").config();

const express = require("express");

const app = express();

const url = require("url");

const { ConfidentialClientApplication } = require("@azure/msal-node");

const PORT = process.env.PORT || 3000;

const authConfig = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: process.env.AUTHORITY,
    clientSecret: process.env.CLIENT_SECRET,
  },
};


const request = {
  scopes: ["User.read","Mail.read"],
  redirectUri: process.env.REDIRECT_URI,
};


const client = new ConfidentialClientApplication(authConfig);


app.get("/", async (req, res) => {
  try {
    if (req.query.code) {
      return res.redirect(
        url.format({ pathname: "/redirect", query: req.query })
      );
    }

    let authUrl = await client.getAuthCodeUrl(request);
    res.redirect(authUrl);
  } catch (error) {
    console.error(error);
  }
});


app.get("/redirect", async (req, res) => {
    try {

        let { account } = await client.acquireTokenByCode({ ...request, code: req.query.code }, { code: req.query.code })
        let { username } = account

        res.status(200).send({ message: "token has been acquired successfully", username })
    } catch (error) {

        res.status(500).send(error)
    }
})

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
```

<br><br>

# Creating the email client with authentication

In this section we will see how can i send email to user using `@azure/communication`.<br/>
To do that we need to install two required libraries:

```cmd
  # to authenticate user

  npm install @azure/identity

  # to send email

  npm install @azure/communication-email --save
```

After the installation,we need to create new client email:<br/><br/>

## Create new client email

```javascript
import { DefaultAzureCredential } from "@azure/identity";

import { EmailClient } from "@azure/communication-email";

const endpoint = "https://<resource-name>.communication.azure.com";

let credential = new DefaultAzureCredential();

const emailClient = new EmailClient(endpoint, credential);
```

After created client we can send email to target user. we can do like this:

```javascript
async function main() {
  const POLLER_WAIT_TIME = 10;
  try {
    const message = {
      senderAddress:
        "<donotreply@xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.azurecomm.net>",
      content: {
        subject: "Welcome to Azure Communication Services Email",
        plainText:
          "This email message is sent from Azure Communication Services Email using the JavaScript SDK.",
      },
      recipients: {
        to: [
          {
            address: "<emailalias@emaildomain.com>",
            displayName: "Customer Name",
          },
        ],
      },
    };

    const poller = await emailClient.beginSend(message);

    if (!poller.getOperationState().isStarted) {
      throw "Poller was not started.";
    }

    let timeElapsed = 0;
    while (!poller.isDone()) {
      poller.poll();
      console.log("Email send polling in progress");

      await new Promise((resolve) =>
        setTimeout(resolve, POLLER_WAIT_TIME * 1000)
      );
      timeElapsed += 10;

      if (timeElapsed > 18 * POLLER_WAIT_TIME) {
        throw "Polling timed out.";
      }
    }

    if (poller.getResult().status === KnownEmailSendStatus.Succeeded) {
      console.log(
        `Successfully sent the email (operation id: ${poller.getResult().id})`
      );
    } else {
      throw poller.getResult().error;
    }
  } catch (e) {
    console.log(e);
  }
}

main();
```

then when main function is calling user wil be receive an email address.

thank you for your time to read this tutoriel.
