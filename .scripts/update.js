const fs = require('fs');
const moment = require('moment');
const { encode } = require('./base36.js');

const tokens = new Map();
const sectionStart = 1;
const subsectionStart = 1;

tokens.set(/([⁰¹²³⁴-⁹₀-₉]+)/g, '**$1**');
tokens.set('[date]', moment.utc().format('dddd, MMMM Do YYYY, hh:mm:ss UTC'));

tokens.set('{#rules}', '<#833335772614492200>');
tokens.set('{#announcements}', '<#835491648246906880>');
tokens.set('{#general}', '<#833337196463128596>');
tokens.set('{#suggestions}', '<#840082092750667777>');
tokens.set('{#bot-chat}', '<#833337845288665139>');
tokens.set('{#music-bot}', '<#833340606767300618>');
tokens.set('{#your-stuff}', '<#833392540974710795>');
tokens.set('{#pluralkit-configure}', '<#833340626351292477>');

tokens.set('{@Family}', '<@&835268804149379154>');
tokens.set('{@Staff}', '');

tokens.set('{@Europa}', '<@539609203732643850>');
tokens.set('{@Sophia}', '<@628611398108315696>');

tokens.set('{@PluralKit}', '<@466378653216014359>');
tokens.set('{@NQN}', '<@559426966151757824>');
tokens.set('{@ModMail}', '<@575252669443211264>');

tokens.set('{ToS}', '[ToS](<https://discord.com/terms>)');
tokens.set('{Guidelines}', '[Guidelines](<https://discord.com/guidelines>)');
tokens.set('{GitHub Repository}', '[GitHub Repository](<https://github.com/SophiaFoxyCoxy/Europa-Server-Rules>)');
tokens.set('{Plurality}', '[Plurality](<https://pluralityresource.org/plurality-information/>)');
tokens.set('{Dissociative Disorders}', '[Dissociative Disorders](todo)');

function insertNumbers(lines) {
    const prefixes = [];
    let section = sectionStart - 1;
    let subsection = subsectionStart;

    const newLines = lines.map(line => {
        if (line.startsWith('x)')) {

            subsection = subsectionStart;
            prefixes.push(`${encode(++section)})`);

            return line.substring(4);
        } else if (line.startsWith('x.y)')) {
            prefixes.push(`${encode(section)}.${encode(subsection++)})`);

            return line.substring(4);
        }

        prefixes.push(null);
        return line;
    });

    const perfixLength = prefixes.reduce((longest, current) => current?.length ?? 0 > longest ? current.length : longest, 0);
    return newLines.map((line, index) => {
        if (prefixes[index] !== null) {
            return '> `' + prefixes[index].padEnd(perfixLength) + '`' + line;
        } else {
            return line;
        }
    });
}

async function main() {
    const lines = insertNumbers(fs.readFileSync('rules.in.md', 'utf-8').split('\n'))
        .map(line => {
            let newLine = line;
            tokens.forEach((replace, search) => {
                if (typeof search !== 'string') {
                    newLine = newLine.replaceAll(search, replace);
                } else if (!search.startsWith('{') && !search.endsWith('}')) {
                    newLine = newLine.replaceAll(search, replace);
                }
            });
            return newLine + '  ';
        });
    
    fs.writeFileSync('../rules.md', lines.map(line => {
        if (line === '==----==  ' || line == '  ') {
            return '';
        }
        return line;
    }).join('\n').replaceAll(/[{}]/g, ''));

    fs.writeFileSync('rules.out.md', lines.map(line => {
        let newLine = line;
        tokens.forEach((replace, search) => {
            if (typeof search === 'string' && search.startsWith('{') && search.endsWith('}')) {
                newLine = newLine.replaceAll(search, replace);
            }
        });
        return newLine.trim();
    }).join('\n'));
}

main().catch((e) => {
    console.log(e);
    process.exit(1);
});
