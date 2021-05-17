const fetch = require('node-fetch');
const moment = require('moment');
const fs = require("fs")

const rulesChannel = ""
const token = ""
const rulesWebhook = ""
const announcementWebhook = ""
const hash = ""

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const datetime = moment.utc().format("dddd, MMMM Do YYYY, hh:mm:ss UTC")

    console.log("Reading rules...")
    const rules = fs.readFileSync("rules.txt", "utf8").split("==----==")

    console.log("Fetching profile...")
    const profile = (await fetch("https://api.pluralkit.me/v1/s/omtxn/members").then(res => res.json())).find(profile => profile.id === "jdhjm")

    console.log("Fetching messages...")
    const headers = { Authorization: `Bot ${token}` }
    const messages = await fetch(`https://discord.com/api/v9/channels/${rulesChannel}/messages`, { headers }).then(res => res.json())

    let i = 0
    for (const message of messages) {
        console.log(`Deleting message ${++i} of ${messages.length}...`)
        await fetch(`https://discord.com/api/v9/channels/${rulesChannel}/messages/${message.id}`, { method: "DELETE", headers })
        await sleep(1250)
    }

    i = 0
    for (const content of rules) {
        console.log(`Sending message ${++i} of ${rules.length}...`)
        if (content === "") continue

        await fetch(rulesWebhook, {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: content.replaceAll("{date}", datetime),
                username: profile.name,
                avatar_url: profile.avatar_url,
                allowed_mentions: { "parse": [] }
            })
        })
        await sleep(1250)
    }

    console.log(`Sending announcement...`)
    await fetch(announcementWebhook, {
        method: 'post',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: "",
            username: profile.name,
            avatar_url: profile.avatar_url,
            allowed_mentions: { "parse": ["everyone"] }
        })
    })

    console.log("Done!")
}

main()