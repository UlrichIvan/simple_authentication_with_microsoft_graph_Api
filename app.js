require('dotenv').config()

const express = require("express")
const app = express()
const url = require("url")
const { ConfidentialClientApplication } = require("@azure/msal-node")
const session = require('express-session')
const { default: axios } = require('axios')
const { CLIENT_ID, CLIENT_SECRET, AUTHORITY, REDIRECT_URI, PORT, MESSAGES } = require('./config')
const Filestore = require("session-file-store")(session)

const authConfig = {
    auth: {
        clientId: CLIENT_ID,
        authority: AUTHORITY,
        clientSecret: CLIENT_SECRET
    }
}
const request = {
    scopes: ["User.Read", "profile"],
    redirectUri: REDIRECT_URI,
}

const client = new ConfidentialClientApplication(authConfig)

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: new Filestore()
}))

app.get('/', async (req, res) => {
    try {

        if (req.query.code) {
            return res.redirect(url.format({ pathname: "/redirect", query: req.query }))
        }

        let authUrl = await client.getAuthCodeUrl(request)

        res.redirect(authUrl)

    } catch (error) {
        console.error(error)
    }
})




app.get("/redirect", async (req, res) => {
    try {

        // let { accessToken } = await client.acquireTokenByCode({ ...request, code: req.query.code }, { code: req.query.code })

        let data = await client.acquireTokenByCode({ ...request, code: req.query.code }, { code: req.query.code })


        // const user = {
        //     username: data.account.username,
        //     idToken: data.idToken,
        //     accessToken: data.accessToken
        // }
        // const url = `https://graph.microsoft.com/v1.0/me`

        const headers = {
            Authorization: `Bearer ${accessToken}`
        }

        let messages = await axios.get(MESSAGES, {
            headers
        })

        return res.status(200).send(data,messages)

    } catch (error) {
        res.status(500).send(error)
    }
})

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))  