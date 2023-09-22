const { fetchUser } = require("../services/api")

module.exports = async (req, res, next) => {

    try {
        let accessToken = req.session.accessToken

        const user = await fetchUser(accessToken)

        req.email = user?.mail

        return res.status(200).send(user)

        next()

    } catch (error) {
        res.status(500).send(error)
    }


}