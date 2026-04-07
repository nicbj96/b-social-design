const fs = require('fs');
const t = fs.readFileSync('build_out.txt', 'utf8').replace(/\x1b\[[0-9;]*m/g, '');
const lines = t.split('\n');
const last = lines.slice(-10).join('\n');
console.log(last);
