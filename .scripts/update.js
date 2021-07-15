const fs = require('fs');
const moment = require('moment');
const { encode } = require('./base36.js');

const tokens = new Map();
const sectionStart = 1;
const subsectionStart = 1;

tokens.set('{date}', moment.utc().format('dddd, MMMM Do YYYY, hh:mm:ss UTC'));

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
    const lines = fs.readFileSync('../rules.template.txt', 'utf-8')
        .split('\n')
        .map(line => {
            tokens.forEach((replace, search) => line = line.replaceAll(search, replace));
            return line;
        });

    fs.writeFileSync('../rules.txt', insertNumbers(lines).join('\n'));
}

main().catch((e) => {
    console.log(e);
    process.exit(1);
});
