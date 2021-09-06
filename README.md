# Europa's Discord Server Rules
Rules for Europa's Discord Server. Uses GitHub Actions to automatically number the rules, and apply changes to the rules, before updating it on Discord and notifying the users.

## How to run
We do not and will not provide support on how to run it since it's a personal project. But it should be rather simple.

1. Fork this repository
2. Add GitHub Secrets (see below)
3. Create a dev branch
4. Edit `.scripts/rules.in.md` on the dev branch
5. Edit any Search/Replace tokens in `.scripts/update.js`
6. Create pull request from dev to main. GitHub Actions will now update `rules.md`
7. Accept pull request. GitHub Actions will update the rules then notify the users of changes

## Files
### rules.md
Don't edit this file! Only used to show history.

### .scripts/rules.in.md
Edit this file! This file is process by GitHub Actions to automatically format the rules.

 - Automatically numbering `x)` and `x.y)` becomes `1)  ` and `1.1)`
 - `[date]` is filled with the current date and time
 - Tokens in `.scripts/update.js` are applied

### .scripts/rules.out.md
Don't edit this file! Used by the `.script/notify.js` script.

### .scripts/update.js
This script is used by GitHub Actions to update `rules.md` and `.scripts/rules.out.md`. Following configuration below.

 - `sectionStart` - The beginning value of x
 - `subsectionStart` - The beginning value of y
 - `tokens` - A map containing entries to find and replace on all lines. Search tokens starting with `{` and ending with `}` are only replaced in `.scripts/rules.out.md`

### .script/notify.js
This script is used by GitHub Actions to notify and update the rules on the Discord Server. Environment variables below.

 - `TOKEN` - The token of a Discord Bot with permissions to delete messages in the `RULES_CHANNEL`
 - `RULES_CHANNEL` - The Snowflake ID of the rules channel
 - `RULES_WEBHOOK` - The webhook used to send the rules
 - `ANNOUNCEMENT_WEBHOOK` - The webhook used to announce changes
 - `AVATAR` - The webhook's profile picture. Has to be a URL.
 - `NAME` - The username of the webhook.