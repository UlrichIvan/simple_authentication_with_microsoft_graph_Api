require('dotenv').config()

const express = require("express")
const app = express()
const url = require("url")
const { ConfidentialClientApplication } = require("@azure/msal-node")
const PORT = process.env.PORT || 3000

const authConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: process.env.AUTHORITY,
        clientSecret: process.env.CLIENT_SECRET
    }
}
const request = {
    scopes: ["User.read"],
    redirectUri: process.env.REDIRECT_URI
}

const client = new ConfidentialClientApplication(authConfig)

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
        let { account } = await client.acquireTokenByCode({ ...request, code: req.query.code }, { code: req.query.code })
        let { username } = account
        res.status(200).send({ message: "token has been acquired successfully", username })
    } catch (error) {
        res.status(500).send(error)
    }
})

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))  