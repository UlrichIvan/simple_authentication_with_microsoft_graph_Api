const { default: axios } = require("axios")

module.exports.fetchUser = async (accessToken = "") => {
    try {
        const res = await axios.get(process.env.RESOURCE_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        })
        return res.data
    } catch (err) {
        return console.log(err)
    }

}


module.exports.fetchMessges = async (accessToken = "", mail = "") => {
    try {
        const url = process.env.RESOURCE_EMAILS.replace("{EMAIL}", mail)

        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        })

        return res.data
    } catch (err) {
        return console.log(err)
    }

}