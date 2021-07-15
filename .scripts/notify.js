const fetch = require('node-fetch');
const fs = require('fs');

const token = process.env.TOKEN;
const rulesChannel = process.env.RULES_CHANNEL;
const rulesWebhook = process.env.RULES_WEBHOOK;
const announcementWebhook = process.env.ANNOUNCEMENT_WEBHOOK;
const hash = process.env.GITHUB_SHA;
const avatar = process.env.AVATAR;
const name = process.env.NAME;
const domain = process.env.GITHUB_SERVER_URL;
const repo = process.env.GITHUB_REPOSITORY;

async function checkStatus(res) {
    if (res.ok) {
        return res;
    } else {
        throw new Error(`Fetch Failed - ${res.status} ${res.statusText} - ${await res.text()}`);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function request(url, data) {
    return fetch(url, data)
        .then(checkStatus)
        .then(res => res.json());
}

async function main() {
    console.log('Reading rules...');
    const sections = fs.readFileSync('rules.out.md', 'utf8').split('==----==');

    console.log('Fetching messages...');
    const headers = { Authorization: `Bot ${token}` };
    const messages = await request(`https://discord.com/api/v9/channels/${rulesChannel}/messages`, { headers });

    for (let i = 0; i < messages.length; i++) {
        console.log(`Deleting message ${i + 1} of ${messages.length}...`);
        await fetch(`https://discord.com/api/v9/channels/${rulesChannel}/messages/${messages[i].id}`, { method: 'DELETE', headers }).then(checkStatus).then(() => sleep(1000));
    }
    
    for (let i = 0; i < sections.length; i++) {
        console.log(`Sending section ${i + 1} of ${sections.length}...`);
        if (sections[i] === '') continue;

        await request(rulesWebhook + '?wait=true', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: sections[i],
                username: name,
                avatar_url: avatar,
                allowed_mentions: { 'parse': [] }
            })
        }).then(() => sleep(1000));
    }

    console.log('Sending announcement...');
    await request(announcementWebhook + '?wait=true', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `@everyone\nAn admin changed the rules. See the changes [here](<${domain}/${repo}/commit/${hash}>)`,
            username: name,
            avatar_url: avatar,
            allowed_mentions: { 'parse': ['everyone'] }
        })
    });

    console.log('Done!');
}

main().catch((e) => {
    console.log(e);
    process.exit(1);
});
