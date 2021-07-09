const fetch = require('node-fetch')
const moment = require('moment')
const fs = require("fs")

const token = process.env.TOKEN
const rulesChannel = process.env.RULES_CHANNEL
const rulesWebhook = process.env.RULES_WEBHOOK
const announcementWebhook = process.env.ANNOUNCEMENT_WEBHOOK
const hash = process.env.GITHUB_SHA

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function checkStatus(res) {
    if (res.ok) {
        return res
    } else {
        throw new Error(`Fetch Failed - ${res.status} ${res.statusText} - ${await res.text()}`)
    }
}

async function main() {
    const datetime = moment.utc().format("dddd, MMMM Do YYYY, hh:mm:ss UTC")

    console.log("Reading rules...")
    const rules = fs.readFileSync("rules.txt", "utf8").split("==----==").map(section => section.trim())

    console.log("Validing rules sections length...")
    if (rules.some(section => section.length > 2000)) {
        throw new Error("A section of the rules is larger than 2000 characters")
    }

    console.log("Fetching profile...")
    const profile = (await fetch("https://api.pluralkit.me/v1/s/omtxn/members").then(res => res.json())).find(profile => profile.id === "jdhjm")

    console.log("Fetching messages...")
    const headers = { Authorization: `Bot ${token}` }
    const messages = await fetch(`https://discord.com/api/v9/channels/${rulesChannel}/messages`, { headers }).then(checkStatus).then(res => res.json())

    let i = 0
    for (const message of messages) {
        console.log(`Deleting message ${++i} of ${messages.length}...`)
        await fetch(`https://discord.com/api/v9/channels/${rulesChannel}/messages/${message.id}`, { method: "DELETE", headers }).then(checkStatus)
        await sleep(1250)
    }

    i = 0
    for (const section of rules) {
        console.log(`Sending rules section ${++i} of ${rules.length}...`)
        if (section === "") continue

        await fetch(rulesWebhook, {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: section.replaceAll("{date}", datetime),
                username: profile.name,
                avatar_url: profile.avatar_url,
                allowed_mentions: { "parse": [] }
            })
        }).then(checkStatus)
        await sleep(1250)
    }

    console.log(`Sending announcement...`)
    await fetch(announcementWebhook, {
        method: 'post',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: `@everyone\nAn admin changed the rules. See the changes [here](<https://github.com/SophiaFoxyCoxy/Europa-Server-Rules/commit/${hash}>)`,
            username: profile.name,
            avatar_url: profile.avatar_url,
            allowed_mentions: { "parse": ["everyone"] }
        })
    }).then(checkStatus)

    console.log("Done!")
}

main().catch((e) => {
   console.log(e)
   process.exit(1)
})
